#!/usr/bin/env python3
'''Build a local, searchable UPSC exam-question corpus from official UPSC document listings.

Default behaviour only syncs the official document index. It does NOT download thousands of PDFs.
Question extraction is heuristic and always labels records as candidates needing human review.
Official PYQs and generated practice questions are stored in separate tables.
'''
from __future__ import annotations
import argparse, csv, hashlib, json, re, sqlite3, sys, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
import requests

BASE='https://cms.upsc.gov.in'
DETAILS=BASE+'/previous-exam-details/'
DB=Path('upsc_pyq_searchable.sqlite')
PDF_DIR=Path('upsc_source_pdfs')
UA='UPSC-Corpus-Research/1.0 (personal educational archive; contact not provided)'

SCHEMA='''
CREATE TABLE IF NOT EXISTS sources(source_id TEXT PRIMARY KEY,source_name TEXT,source_kind TEXT,authority TEXT,url TEXT,last_checked TEXT,observed_count TEXT,note TEXT);
CREATE TABLE IF NOT EXISTS exams(exam_id TEXT PRIMARY KEY,exam_name TEXT NOT NULL,year TEXT,exam_family TEXT,source_id TEXT,registry_status TEXT DEFAULT 'listed');
CREATE TABLE IF NOT EXISTS documents(document_id TEXT PRIMARY KEY,exam_id TEXT,exam_name TEXT NOT NULL,year TEXT,paper TEXT,document_type TEXT NOT NULL,authority TEXT,source_url TEXT NOT NULL,uploaded TEXT,file_size TEXT,verification_status TEXT NOT NULL,source_ref TEXT,local_path TEXT,extraction_status TEXT DEFAULT 'not_downloaded',note TEXT);
CREATE TABLE IF NOT EXISTS questions(question_id TEXT PRIMARY KEY,document_id TEXT NOT NULL,exam_name TEXT,year TEXT,paper TEXT,page_number INTEGER,question_number TEXT,language TEXT,question_text TEXT NOT NULL,option_a TEXT,option_b TEXT,option_c TEXT,option_d TEXT,answer_letter TEXT,answer_source_document_id TEXT,answer_status TEXT DEFAULT 'not_verified',explanation TEXT,explanation_type TEXT,syllabus_subject TEXT,syllabus_topic TEXT,extraction_status TEXT DEFAULT 'needs_human_review',is_official_pyq INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS answer_keys(answer_key_id TEXT PRIMARY KEY,document_id TEXT NOT NULL,exam_name TEXT,year TEXT,paper TEXT,test_series TEXT,question_number TEXT,answer_letter TEXT,dropped_or_changed INTEGER DEFAULT 0,verification_status TEXT DEFAULT 'candidate_needs_review');
CREATE TABLE IF NOT EXISTS explanations(explanation_id TEXT PRIMARY KEY,question_id TEXT NOT NULL,explanation_text TEXT NOT NULL,explanation_type TEXT NOT NULL,source_url TEXT,review_status TEXT DEFAULT 'pending_review',reviewer TEXT,created_at TEXT);
CREATE TABLE IF NOT EXISTS practice_questions(practice_id TEXT PRIMARY KEY,exam_family TEXT,syllabus_subject TEXT,syllabus_topic TEXT,difficulty TEXT,question_text TEXT NOT NULL,option_a TEXT,option_b TEXT,option_c TEXT,option_d TEXT,answer_letter TEXT,explanation TEXT,generation_model TEXT,generated_at TEXT,review_status TEXT DEFAULT 'pending_review',content_label TEXT DEFAULT 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ');
CREATE TABLE IF NOT EXISTS document_pages(document_id TEXT NOT NULL,page_number INTEGER NOT NULL,page_text TEXT,extraction_quality TEXT DEFAULT 'not_reviewed',PRIMARY KEY(document_id,page_number));
CREATE TABLE IF NOT EXISTS ingest_log(run_id TEXT PRIMARY KEY,started_at TEXT,finished_at TEXT,action TEXT,records_seen INTEGER DEFAULT 0,records_added INTEGER DEFAULT 0,errors INTEGER DEFAULT 0,note TEXT);
CREATE INDEX IF NOT EXISTS idx_exams_name ON exams(exam_name);
CREATE INDEX IF NOT EXISTS idx_docs_exam_year ON documents(exam_name,year);
CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_questions_exam_year ON questions(exam_name,year);
'''

def connect():
    con=sqlite3.connect(DB); con.row_factory=sqlite3.Row; con.execute('PRAGMA foreign_keys=ON'); con.executescript(SCHEMA)
    try:
        con.execute('CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(question_id UNINDEXED,question_text,options_text,exam_name UNINDEXED,subject UNINDEXED,topic UNINDEXED)')
        con.execute('CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(document_id UNINDEXED,title,document_text,exam_name UNINDEXED,year UNINDEXED)')
    except sqlite3.OperationalError: pass
    return con

def refresh_fts(con):
    """Rebuild FTS indexes from extracted question and document rows."""
    tables={r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    if 'questions_fts' in tables:
        con.execute('DELETE FROM questions_fts')
        for q in con.execute('SELECT question_id,question_text,option_a,option_b,option_c,option_d,exam_name,syllabus_subject,syllabus_topic FROM questions'):
            options=' | '.join(x for x in (q['option_a'],q['option_b'],q['option_c'],q['option_d']) if x)
            con.execute('INSERT INTO questions_fts(question_id,question_text,options_text,exam_name,subject,topic) VALUES(?,?,?,?,?,?)',
                        (q['question_id'],q['question_text'],options,q['exam_name'] or '',q['syllabus_subject'] or '',q['syllabus_topic'] or ''))
    if 'documents_fts' in tables:
        con.execute('DELETE FROM documents_fts')
        rows=con.execute("""SELECT d.document_id,d.paper,d.exam_name,d.year,COALESCE(GROUP_CONCAT(p.page_text, char(10)), '') AS body
                              FROM documents d LEFT JOIN document_pages p ON p.document_id=d.document_id
                              GROUP BY d.document_id,d.paper,d.exam_name,d.year""").fetchall()
        for d in rows:
            con.execute('INSERT INTO documents_fts(document_id,title,document_text,exam_name,year) VALUES(?,?,?,?,?)',
                        (d['document_id'],d['paper'] or '',d['body'] or '',d['exam_name'] or '',d['year'] or ''))

def get_session():
    s=requests.Session(); s.headers.update({'User-Agent':UA,'Accept':'text/html,application/json,application/pdf,*/*'}); return s

def parse_flight_exams(html:str):
    # Next.js Flight payloads store a JSON-escaped segment in self.__next_f.push([1,"..."]).
    script_re=re.compile(r'self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)')
    for m in script_re.finditer(html):
        try: payload=json.loads(m.group(1))
        except Exception: continue
        for line in payload.split('\n'):
            seg=re.match(r'^\d+:(\[.*\])$',line,re.S)
            if not seg: continue
            try: obj=json.loads(seg.group(1)); props=obj[3]
            except Exception: continue
            if isinstance(props,dict) and isinstance(props.get('data'),dict) and isinstance(props['data'].get('exams'),list):
                return props['data']['exams']
    return []

def fetch_registry(session):
    r=session.get(DETAILS,timeout=60); r.raise_for_status()
    initial=parse_flight_exams(r.text)
    if not initial: raise RuntimeError('Could not parse the first page of official UPSC Previous Exam Details.')
    # This public endpoint is referenced by the page's own Next.js data.
    remaining_url=urljoin(BASE,'/api/exam-resources/remaining')
    rr=session.get(remaining_url,timeout=120); rr.raise_for_status()
    rem=rr.json().get('exams',[])
    by_id={str(x.get('id')):x for x in initial+rem if x.get('id')}
    return list(by_id.values())

def doc_hash(exam_id,year,doctype,title,url):
    raw='|'.join(map(str,[exam_id,year,doctype,title,url]))
    return hashlib.sha1(raw.encode('utf-8')).hexdigest()[:20]

def sync_index():
    s=get_session(); exams=fetch_registry(s); con=connect(); seen=0; added=0
    source_id='UPSC_PREVIOUS_EXAM_DETAILS'
    con.execute('''INSERT OR REPLACE INTO sources VALUES(?,?,?,?,?,?,?,?)''',(
      source_id,'UPSC Previous Exam Details','official_exam_registry','Union Public Service Commission (official)',DETAILS,
      datetime.now(timezone.utc).isoformat(),'Fetched live','Official registry and its linked public API'))
    for ex in exams:
        eid=str(ex.get('id') or '')
        label=(ex.get('label') or '').strip()
        con.execute('INSERT OR REPLACE INTO exams(exam_id,exam_name,exam_family,source_id,registry_status) VALUES(?,?,?,?,?)',
                    (eid,label,guess_family(label),source_id,'listed'))
        for yr in ex.get('years',[]):
            year=str(yr.get('year') or '')
            con.execute('UPDATE exams SET year=COALESCE(year,?) WHERE exam_id=?',(year,eid))
            for cat in yr.get('categories',[]):
                for dt in cat.get('documentTypes',[]):
                    dtype=(dt.get('type') or 'Unknown').strip()
                    for item in dt.get('items',[]):
                        title=(item.get('title') or '').strip()
                        url=(item.get('url') or '').strip()
                        if not url or url.startswith('$') or not url.lower().startswith('http'): continue
                        did=doc_hash(eid,year,dtype,title,url); seen+=1
                        before=con.total_changes
                        con.execute('''INSERT OR IGNORE INTO documents(document_id,exam_id,exam_name,year,paper,document_type,authority,source_url,uploaded,file_size,verification_status,source_ref,extraction_status,note)
                           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                           (did,eid,label,year,title,dtype,'UPSC official listing',url,item.get('dateOfUpload'),item.get('size'),
                            'listed_in_official_upsc_registry',source_id,'not_downloaded','Source metadata copied from official public registry; PDF contents not yet parsed.'))
                        if con.total_changes>before: added+=1
    refresh_fts(con)
    con.commit(); con.close()
    print(f'Official registry exams indexed: {len(exams)}')
    print(f'Document records seen: {seen}; newly added: {added}')
    print('Question/answer rows are not fabricated; run download and extract on selected exam(s).')

def guess_family(label):
    l=label.lower()
    for key,name in [('civil services','CSE'),('indian forest service','IFoS'),('combined defence services','CDS'),('national defence academy','NDA'),('central armed police forces','CAPF'),('combined medical services','CMS'),('engineering services','ESE'),('geo-scientist','CGS'),('indian economic service','IES/ISS'),('cisf','CISF LDCE')]:
        if key in l: return name
    return 'Other UPSC examination'

def download_selected(max_downloads=20,exam=None,year=None):
    PDF_DIR.mkdir(exist_ok=True); con=connect(); q="SELECT * FROM documents WHERE document_type LIKE '%Question Paper%' OR document_type LIKE '%Answer Key%'"; rows=con.execute(q+' ORDER BY CAST(year AS INTEGER) DESC').fetchall()
    if exam: rows=[x for x in rows if exam.lower() in x['exam_name'].lower()]
    if year: rows=[x for x in rows if x['year']==str(year)]
    rows=rows[:max_downloads]; s=get_session(); done=0
    for row in rows:
        try:
            r=s.get(row['source_url'],timeout=120,stream=True); r.raise_for_status()
            content=r.content
            if not content.startswith(b'%PDF'):
                raise ValueError('URL did not return a PDF file')
            name=f"{row['document_id']}.pdf"; path=PDF_DIR/name; path.write_bytes(content)
            con.execute('UPDATE documents SET local_path=?,extraction_status=? WHERE document_id=?',(str(path), 'downloaded',row['document_id']))
            done+=1; print(f"Downloaded {row['exam_name']} | {row['year']} | {row['paper']}")
            time.sleep(1.0)
        except Exception as e:
            con.execute('UPDATE documents SET extraction_status=? WHERE document_id=?',(f'download_error: {e}',row['document_id']))
            print(f"ERROR {row['source_url']}: {e}",file=sys.stderr)
    con.commit();con.close();print(f'Downloaded {done}/{len(rows)} selected PDFs.')

def split_question_candidates(text):
    # Conservative pattern: records candidates only; it cannot reliably distinguish numbered sub-statements.
    starts=list(re.finditer(r'(?m)^\s*(\d{1,3})\s*[\.)]\s+',text))
    out=[]
    for i,m in enumerate(starts):
        end=starts[i+1].start() if i+1<len(starts) else len(text)
        block=text[m.start():end].strip()
        if len(block)<45: continue
        # Common A-D option patterns. Retain all raw text even when not four options found.
        optpat=re.compile(r'(?mi)^\s*\(?([a-d])\)?\s*[\.)]\s+')
        opts=list(optpat.finditer(block))
        qtext=block[:opts[0].start()].strip() if opts else block
        values={}
        for j,o in enumerate(opts):
            stop=opts[j+1].start() if j+1<len(opts) else len(block)
            values[o.group(1).lower()]=block[o.end():stop].strip()
        # Keep only plausible candidates; all are marked for review.
        if len(qtext)<10: continue
        out.append((m.group(1),qtext,values,block))
    return out

def extract_downloaded():
    try: import fitz
    except ImportError: raise SystemExit('Install PyMuPDF first: pip install pymupdf')
    con=connect(); rows=con.execute("SELECT * FROM documents WHERE local_path IS NOT NULL AND extraction_status='downloaded'").fetchall()
    for row in rows:
        path=Path(row['local_path'])
        try:
            doc=fitz.open(path); page_texts=[]; candidates=0
            for pno,page in enumerate(doc,1):
                txt=page.get_text('text') or ''; page_texts.append(txt)
                quality='text_extracted' if len(txt.strip())>=80 else 'low_text_or_scanned_needs_ocr'
                con.execute('INSERT OR REPLACE INTO document_pages VALUES(?,?,?,?)',(row['document_id'],pno,txt,quality))
                if 'question paper' in (row['document_type'] or '').lower():
                    for qno,qtext,opts,raw in split_question_candidates(txt):
                        qid=hashlib.sha1(f"{row['document_id']}|{pno}|{qno}|{qtext[:100]}".encode()).hexdigest()[:24]
                        con.execute('''INSERT OR IGNORE INTO questions(question_id,document_id,exam_name,year,paper,page_number,question_number,language,question_text,option_a,option_b,option_c,option_d,answer_letter,answer_status,explanation,explanation_type,extraction_status,is_official_pyq)
                          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                          (qid,row['document_id'],row['exam_name'],row['year'],row['paper'],pno,qno,None,qtext,opts.get('a'),opts.get('b'),opts.get('c'),opts.get('d'),None,'not_verified',None,None,'extracted_candidate_needs_human_review',1))
                        candidates+=1
            full='\n\n'.join(page_texts)
            status='text_extracted_questions_candidate_review' if candidates else ('text_extracted_no_reliable_question_split' if len(full.strip()) else 'needs_ocr_or_manual_transcription')
            con.execute('UPDATE documents SET extraction_status=? WHERE document_id=?',(status,row['document_id']))
            print(f"{row['document_id']}: {len(page_texts)} pages, {candidates} question candidates, status={status}")
        except Exception as e:
            con.execute('UPDATE documents SET extraction_status=? WHERE document_id=?',(f'extract_error: {e}',row['document_id']))
            print(f"Extraction error {path}: {e}",file=sys.stderr)
    refresh_fts(con)
    con.commit();con.close()

def search(q,limit=30):
    con=connect(); like='%'+q+'%'
    try:
        rows=con.execute('SELECT q.question_id,q.exam_name,q.year,q.paper,q.question_number,q.question_text,q.answer_letter,q.answer_status FROM questions_fts f JOIN questions q ON q.question_id=f.question_id WHERE questions_fts MATCH ? LIMIT ?', (q,limit)).fetchall()
    except sqlite3.OperationalError:
        rows=con.execute('SELECT question_id,exam_name,year,paper,question_number,question_text,answer_letter,answer_status FROM questions WHERE question_text LIKE ? OR option_a LIKE ? OR option_b LIKE ? OR option_c LIKE ? OR option_d LIKE ? LIMIT ?', (like,like,like,like,like,limit)).fetchall()
    for x in rows: print(f"[QUESTION] {x['exam_name']} {x['year']} | {x['paper']} | Q{x['question_number']}] {x['question_text'][:700]}\nANSWER={x['answer_letter']} ({x['answer_status']})\n")
    if not rows:
        try:
            docs=con.execute('SELECT d.exam_name,d.year,d.paper,d.document_type,d.source_url FROM documents_fts f JOIN documents d ON d.document_id=f.document_id WHERE documents_fts MATCH ? LIMIT ?', (q,limit)).fetchall()
        except sqlite3.OperationalError:
            docs=[]
        if not docs:
            docs=con.execute('SELECT exam_name,year,paper,document_type,source_url FROM documents WHERE exam_name LIKE ? OR year LIKE ? OR paper LIKE ? LIMIT ?', (like,like,like,limit)).fetchall()
        for d in docs: print(f"[DOCUMENT] {d['exam_name']} {d['year']} | {d['document_type']} | {d['paper']}\n{d['source_url']}\n")
        if not docs: print('No indexed question or document matches. Run sync; download/extract PDFs to populate question text.')
    con.close()

def export_csv():
    con=connect()
    for table in ['exams','documents','questions','answer_keys','explanations','practice_questions']:
        rows=con.execute(f'SELECT * FROM {table}').fetchall()
        out=Path(f'{table}.csv')
        with out.open('w',newline='',encoding='utf-8-sig') as f:
            if rows:
                w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows([dict(r) for r in rows])
            else:
                w=csv.writer(f); w.writerow([x[1] for x in con.execute(f'PRAGMA table_info({table})')])
        print(f'Exported {out} ({len(rows)} rows)')
    con.close()

def import_answer_keys(csv_path):
    """Import manually verified answer-key rows; each row must reference an Answer Key document."""
    con=connect(); imported=0; skipped=0
    with Path(csv_path).open('r', newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            document_id=(row.get('document_id') or '').strip()
            if not document_id:
                skipped+=1; print('SKIP: missing document_id'); continue
            doc=con.execute('SELECT * FROM documents WHERE document_id=?',(document_id,)).fetchone()
            if not doc or 'answer key' not in (doc['document_type'] or '').lower():
                skipped+=1; print(f'SKIP: {document_id} is not an indexed Answer Key document'); continue
            answer=(row.get('answer_letter') or '').strip().upper()
            if answer and answer not in {'A','B','C','D','E'}:
                skipped+=1; print(f'SKIP: invalid answer letter {answer}'); continue
            test_series=(row.get('test_series') or '').strip()
            status=(row.get('verification_status') or 'pending_manual_verification').strip()
            if status.lower() in {'official_pdf_and_series_human_verified','human_verified'} and not test_series:
                status='series_not_identified_review_required'
            qno=(row.get('question_number') or '').strip()
            paper=(row.get('paper') or doc['paper'] or '').strip()
            exam=(row.get('exam_name') or doc['exam_name'] or '').strip()
            year=(row.get('year') or doc['year'] or '').strip()
            raw='|'.join([document_id,exam,year,paper,test_series,qno,answer])
            key_id=(row.get('answer_key_id') or hashlib.sha1(raw.encode('utf-8')).hexdigest()[:24]).strip()
            con.execute('''INSERT OR REPLACE INTO answer_keys(answer_key_id,document_id,exam_name,year,paper,test_series,question_number,answer_letter,dropped_or_changed,verification_status)
                           VALUES(?,?,?,?,?,?,?,?,?,?)''',
                        (key_id,document_id,exam,year,paper,test_series,qno,answer,
                         1 if str(row.get('dropped_or_changed','0')).strip().lower() in {'1','true','yes','y'} else 0,status))
            imported+=1
    con.commit(); con.close()
    print(f'Answer-key rows imported: {imported}; skipped: {skipped}')
    print('Reminder: do not mark rows human-verified until the official key PDF, exam, paper, question number and test series have been checked.')

def import_explanations(csv_path):
    """Import teacher/AI explanations only when the referenced question exists."""
    con=connect(); imported=0; skipped=0
    allowed={'teacher_written','ai_generated','external_source_summary'}
    with Path(csv_path).open('r', newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            qid=(row.get('question_id') or '').strip()
            body=(row.get('explanation_text') or '').strip()
            kind=(row.get('explanation_type') or '').strip()
            if not qid or not body or kind not in allowed:
                skipped+=1; print(f'SKIP: invalid explanation row for question {qid or "(missing id)"}'); continue
            if not con.execute('SELECT 1 FROM questions WHERE question_id=?',(qid,)).fetchone():
                skipped+=1; print(f'SKIP: unknown question_id {qid}'); continue
            raw='|'.join([qid,kind,body])
            eid=(row.get('explanation_id') or hashlib.sha1(raw.encode('utf-8')).hexdigest()[:24]).strip()
            con.execute('''INSERT OR REPLACE INTO explanations(explanation_id,question_id,explanation_text,explanation_type,source_url,review_status,reviewer,created_at)
                           VALUES(?,?,?,?,?,?,?,?)''',
                        (eid,qid,body,kind,(row.get('source_url') or '').strip(),(row.get('review_status') or 'pending_review').strip(),(row.get('reviewer') or '').strip(),(row.get('created_at') or datetime.now(timezone.utc).isoformat()).strip()))
            imported+=1
    con.commit(); con.close()
    print(f'Explanation rows imported: {imported}; skipped: {skipped}')
    print('AI-generated explanations remain labelled as AI-generated and should be reviewed before student publication.')

def import_practice(csv_path):
    """Import newly generated practice questions into their separate table."""
    con=connect(); imported=0; skipped=0
    with Path(csv_path).open('r', newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            body=(row.get('question_text') or '').strip()
            if not body:
                skipped+=1; print('SKIP: practice question has no question_text'); continue
            answer=(row.get('answer_letter') or '').strip().upper()
            if answer and answer not in {'A','B','C','D'}:
                skipped+=1; print(f'SKIP: invalid practice answer {answer}'); continue
            raw='|'.join([body,row.get('syllabus_subject',''),row.get('syllabus_topic',''),row.get('generation_model','')])
            pid=(row.get('practice_id') or hashlib.sha1(raw.encode('utf-8')).hexdigest()[:24]).strip()
            label='GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'
            con.execute('''INSERT OR REPLACE INTO practice_questions(practice_id,exam_family,syllabus_subject,syllabus_topic,difficulty,question_text,option_a,option_b,option_c,option_d,answer_letter,explanation,generation_model,generated_at,review_status,content_label)
                           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                        (pid,(row.get('exam_family') or '').strip(),(row.get('syllabus_subject') or '').strip(),(row.get('syllabus_topic') or '').strip(),(row.get('difficulty') or '').strip(),body,(row.get('option_a') or '').strip(),(row.get('option_b') or '').strip(),(row.get('option_c') or '').strip(),(row.get('option_d') or '').strip(),answer,(row.get('explanation') or '').strip(),(row.get('generation_model') or '').strip(),(row.get('generated_at') or datetime.now(timezone.utc).isoformat()).strip(),(row.get('review_status') or 'pending_review').strip(),label))
            imported+=1
    con.commit(); con.close()
    print(f'Generated practice questions imported: {imported}; skipped: {skipped}')
    print('All imported rows are labelled GENERATED_PRACTICE_NOT_OFFICIAL_PYQ and stay separate from official questions.')

def main():
    ap=argparse.ArgumentParser(description='Build a searchable UPSC source-backed question corpus.')
    sub=ap.add_subparsers(dest='cmd',required=True)
    sub.add_parser('init',help='Create the SQLite schema.')
    sub.add_parser('sync',help='Sync all exam/document references from the official UPSC registry.')
    d=sub.add_parser('download',help='Download a limited set of official question papers/answer keys.');d.add_argument('--max-downloads',type=int,default=20);d.add_argument('--exam');d.add_argument('--year')
    sub.add_parser('extract',help='Extract searchable text and question candidates from downloaded PDFs.')
    s=sub.add_parser('search',help='Search extracted question candidates.');s.add_argument('query');s.add_argument('--limit',type=int,default=30)
    ak=sub.add_parser('import-answer-keys',help='Import answer-key rows from a CSV template after source checking.'); ak.add_argument('--file',default='answer_key_import.csv')
    ex=sub.add_parser('import-explanations',help='Import teacher/AI explanations from a CSV template.'); ex.add_argument('--file',default='explanation_import.csv')
    pr=sub.add_parser('import-practice',help='Import generated practice items into the separate practice_questions table.'); pr.add_argument('--file',default='generated_practice.csv')
    sub.add_parser('export-csv',help='Export database tables to CSV.')
    a=ap.parse_args()
    if a.cmd=='init':
        con=connect(); refresh_fts(con); con.commit(); con.close(); print(f'Initialized {DB}')
    elif a.cmd=='sync': sync_index()
    elif a.cmd=='download': download_selected(a.max_downloads,a.exam,a.year)
    elif a.cmd=='extract': extract_downloaded()
    elif a.cmd=='search': search(a.query,a.limit)
    elif a.cmd=='import-answer-keys': import_answer_keys(a.file)
    elif a.cmd=='import-explanations': import_explanations(a.file)
    elif a.cmd=='import-practice': import_practice(a.file)
    elif a.cmd=='export-csv': export_csv()
if __name__=='__main__': main()

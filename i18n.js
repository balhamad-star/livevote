export const STR = {
  en: {
    appName: 'LiveVote', presenterTag: 'Presenter',
    buildSession: 'Build your session',
    buildHint: 'Write your questions, then start the session. Participants join by scanning the QR code or typing a 6-character code.',
    sessionTitle: 'Session title', sessionTitlePh: 'e.g. ICENG111 — Week 5 check-in',
    addQuestion: 'Add question', loadSample: 'Load sample questions', saveFile: 'Save to file', openFile: 'Open file',
    startSession: 'Start session', qTextPh: 'Type the question…', optionsPh: 'One option per line',
    type_mc: 'Multiple choice', type_rank: 'Ranking (prioritize)', type_points: 'Weighting (100 points)', type_text: 'Open text',
    hint_mc: 'Participants pick one option.',
    hint_rank: 'Participants rank every option, 1 = highest priority. Combined with Borda scoring (rank 1 gets the most points).',
    hint_points: 'Participants split 100 points across the options. Results show the average weight of each.',
    hint_text: 'Participants type a short answer; answers appear as a wall of notes.',
    moveUp: 'Move up', moveDown: 'Move down', del: 'Delete', confirmDel: 'Delete this question?',
    confirmSample: 'Replace your current questions with the sample set?',
    errNoQuestions: 'Add at least one question.', errQText: 'Question {n} has no text.', errQOpts: 'Question {n} needs at least 2 options.',
    resumeMsg: 'Session {code} is still open.', resume: 'Resume', discard: 'Close it',
    joinAt: 'Join at', withCode: 'code', scanOrVisit: 'Scan the QR code, or go to', andEnterCode: 'and enter the code',
    joined: 'joined', answered: 'answered',
    startFirst: 'Start first question', next: 'Next question', finish: 'Finish', prev: 'Previous',
    showResults: 'Show results', hideResults: 'Reopen answers',
    exitSession: 'Close session', confirmExit: 'Close this session? Participants will see that it has ended.',
    exportCsv: 'Export results (CSV)', qPos: 'Question {i} of {n}',
    sessionEnded: 'Session complete', thanks: 'Thank you for taking part!', backToEditor: 'Back to editor',
    demoMode: 'Demo mode — same browser only', liveMode: 'Live',
    responses: 'responses', pts: 'pts', avgRank: 'avg rank', firstVotes: 'ranked #1: {n}', totalPts: 'total {n} pts',
    bordaNote: 'Borda score: rank 1 = {k} pts … rank {k} = 1 pt', weightNote: 'Average share of 100 points',
    noResponses: 'No responses yet', shortcuts: 'Keys: → next · ← previous · R results',
    // participant
    joinTitle: 'Join a session', enterCode: 'Session code', yourName: 'Your name (optional)', joinBtn: 'Join',
    notFound: 'No session found with that code.', connecting: 'Connecting…',
    youreIn: "You're in!", waitPresenter: 'Wait for the presenter to start…',
    submit: 'Submit', received: 'Answer received ✓', canChange: 'You can change it until the results are shown.',
    changeAnswer: 'Change answer', waitResults: 'Waiting for the results…',
    tapToRank: 'Tap the options in order of priority — your first tap is #1.', reset: 'Reset',
    pointsLeft: 'Points left: {n}', pointsOver: 'Too many — remove {n}', splitHint: 'Share 100 points across the options.',
    textPh: 'Type your answer…', results: 'Results', sessionClosed: 'This session has ended. Thank you!',
    hostLink: "I'm the presenter →", leave: 'Leave',
  },
  ar: {
    appName: 'تصويت مباشر', presenterTag: 'المقدّم',
    buildSession: 'إعداد الجلسة',
    buildHint: 'اكتب أسئلتك ثم ابدأ الجلسة. ينضم المشاركون بمسح رمز QR أو بإدخال رمز من 6 خانات.',
    sessionTitle: 'عنوان الجلسة', sessionTitlePh: 'مثال: ورشة ضمان الجودة — اليوم الأول',
    addQuestion: 'إضافة سؤال', loadSample: 'تحميل أسئلة نموذجية', saveFile: 'حفظ في ملف', openFile: 'فتح ملف',
    startSession: 'بدء الجلسة', qTextPh: 'اكتب نص السؤال…', optionsPh: 'خيار واحد في كل سطر',
    type_mc: 'اختيار من متعدد', type_rank: 'ترتيب الأولويات', type_points: 'توزيع الأوزان (100 نقطة)', type_text: 'إجابة نصية',
    hint_mc: 'يختار المشارك خيارًا واحدًا.',
    hint_rank: 'يرتّب المشارك جميع الخيارات، 1 = الأعلى أولوية. تُجمع النتائج بطريقة بوردا (المرتبة الأولى تنال أعلى النقاط).',
    hint_points: 'يوزّع المشارك 100 نقطة على الخيارات. تعرض النتائج متوسط وزن كل خيار.',
    hint_text: 'يكتب المشارك إجابة قصيرة، وتظهر الإجابات كلوحة ملاحظات.',
    moveUp: 'تحريك لأعلى', moveDown: 'تحريك لأسفل', del: 'حذف', confirmDel: 'حذف هذا السؤال؟',
    confirmSample: 'استبدال أسئلتك الحالية بالأسئلة النموذجية؟',
    errNoQuestions: 'أضف سؤالًا واحدًا على الأقل.', errQText: 'السؤال {n} بلا نص.', errQOpts: 'السؤال {n} يحتاج إلى خيارين على الأقل.',
    resumeMsg: 'الجلسة {code} ما زالت مفتوحة.', resume: 'استئناف', discard: 'إغلاقها',
    joinAt: 'ادخل إلى', withCode: 'الرمز', scanOrVisit: 'امسح رمز QR، أو افتح', andEnterCode: 'وأدخل الرمز',
    joined: 'انضموا', answered: 'أجابوا',
    startFirst: 'ابدأ السؤال الأول', next: 'السؤال التالي', finish: 'إنهاء', prev: 'السابق',
    showResults: 'عرض النتائج', hideResults: 'إعادة فتح الإجابة',
    exitSession: 'إغلاق الجلسة', confirmExit: 'إغلاق الجلسة؟ سيرى المشاركون أنها انتهت.',
    exportCsv: 'تصدير النتائج (CSV)', qPos: 'السؤال {i} من {n}',
    sessionEnded: 'اكتملت الجلسة', thanks: 'شكرًا لمشاركتكم!', backToEditor: 'العودة إلى الإعداد',
    demoMode: 'وضع تجريبي — المتصفح نفسه فقط', liveMode: 'مباشر',
    responses: 'إجابة', pts: 'نقطة', avgRank: 'متوسط الترتيب', firstVotes: 'المرتبة الأولى: {n}', totalPts: 'المجموع {n} نقطة',
    bordaNote: 'نقاط بوردا: المرتبة 1 = {k} نقاط … المرتبة {k} = نقطة واحدة', weightNote: 'متوسط الحصة من 100 نقطة',
    noResponses: 'لا توجد إجابات بعد', shortcuts: 'الاختصارات: → التالي · ← السابق · R النتائج',
    joinTitle: 'الانضمام إلى جلسة', enterCode: 'رمز الجلسة', yourName: 'اسمك (اختياري)', joinBtn: 'انضمام',
    notFound: 'لا توجد جلسة بهذا الرمز.', connecting: 'جارٍ الاتصال…',
    youreIn: 'تم انضمامك!', waitPresenter: 'بانتظار أن يبدأ المقدّم…',
    submit: 'إرسال', received: 'تم استلام إجابتك ✓', canChange: 'يمكنك تعديلها حتى تُعرض النتائج.',
    changeAnswer: 'تعديل الإجابة', waitResults: 'بانتظار النتائج…',
    tapToRank: 'اضغط على الخيارات حسب الأولوية — أول ضغطة هي رقم 1.', reset: 'إعادة',
    pointsLeft: 'النقاط المتبقية: {n}', pointsOver: 'تجاوزت الحد — أزل {n}', splitHint: 'وزّع 100 نقطة على الخيارات.',
    textPh: 'اكتب إجابتك…', results: 'النتائج', sessionClosed: 'انتهت هذه الجلسة. شكرًا لك!',
    hostLink: 'أنا المقدّم ←', leave: 'خروج',
  },
};

let lang = localStorage.getItem('lv-lang') || 'en';
export const getLang = () => lang;
export function setLang(l, remember = true) {
  lang = STR[l] ? l : 'en';
  if (remember) localStorage.setItem('lv-lang', lang);
  applyLang();
}
export function t(k, vars) {
  let s = STR[lang][k] ?? STR.en[k] ?? k;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, b);
  return s;
}
export function applyLang(root = document) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.querySelectorAll('[data-t]').forEach((el) => (el.textContent = t(el.dataset.t)));
  root.querySelectorAll('[data-tp]').forEach((el) => (el.placeholder = t(el.dataset.tp)));
  root.querySelectorAll('[data-tt]').forEach((el) => (el.title = t(el.dataset.tt)));
}

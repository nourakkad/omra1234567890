import React, { useMemo, useState } from 'react';
import './App.css';
import { QUESTIONS, McqQuestion } from './questions';

function App() {
  const [step, setStep] = useState<number>(0); // 0 = name, 1..n = questions, n+1 = review
  const [studentName, setStudentName] = useState<string>('');
  // store selected option index for each question id
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [hasTriedNext, setHasTriedNext] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const totalSteps = QUESTIONS.length + 2; // name + questions + review

  const currentQuestion: McqQuestion | undefined =
    step >= 1 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : undefined;

  const isNameStep = step === 0;
  const isReviewStep = step === QUESTIONS.length + 1;

  const canGoNext = () => {
    if (isNameStep) {
      return studentName.trim().length > 0;
    }
    if (currentQuestion) {
      const selectedIndex = answers[currentQuestion.id];
      return typeof selectedIndex === 'number';
    }
    return true;
  };

  const handleNext = () => {
    setHasTriedNext(true);
    if (!canGoNext()) return;

    const movingFromLastQuestionToReview =
      !isNameStep && step === QUESTIONS.length;

    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
    setHasTriedNext(false);

    if (movingFromLastQuestionToReview) {
      void handleSend();
    }
  };

  const handleAnswerChange = (id: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: optionIndex,
    }));
  };

  const { totalCorrect, totalQuestionsWithKey } = useMemo(() => {
    let correct = 0;
    let withKey = 0;
    QUESTIONS.forEach((q) => {
      if (typeof q.correctIndex === 'number') {
        withKey += 1;
        const selected = answers[q.id];
        if (typeof selected === 'number' && selected === q.correctIndex) {
          correct += 1;
        }
      }
    });
    return { totalCorrect: correct, totalQuestionsWithKey: withKey };
  }, [answers]);

  const markFrom100 =
    totalQuestionsWithKey > 0
      ? Math.round((totalCorrect / totalQuestionsWithKey) * 100)
      : 0;

  const buildEmailBody = () => {
    const lines: string[] = [];
    lines.push(`اسم المتدرب: ${studentName}`);
    if (totalQuestionsWithKey > 0) {
      lines.push(`النتيجة: ${totalCorrect} من ${totalQuestionsWithKey}`);
      lines.push(`الدرجة من 100: ${markFrom100} / 100`);
    }
    lines.push('');
    QUESTIONS.forEach((q) => {
      const selectedIndex = answers[q.id];
      const selectedText =
        typeof selectedIndex === 'number'
          ? q.options[selectedIndex]
          : 'لا توجد إجابة';
      lines.push(`السؤال: ${q.text}`);
      lines.push(`إجابة المتدربة: ${selectedText}`);
      if (typeof q.correctIndex === 'number') {
        const correctText = q.options[q.correctIndex];
        const isCorrect =
          typeof selectedIndex === 'number' && selectedIndex === q.correctIndex;
        lines.push(`الإجابة الصحيحة: ${correctText}`);
        lines.push(`النتيجة على هذا السؤال: ${isCorrect ? 'صحيح' : 'خطأ'}`);
      } else {
        lines.push('الإجابة الصحيحة: (لم تُحدَّد بعد)');
      }
      lines.push('');
    });
    return lines.join('\n');
  };

  const handleSend = async () => {
    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const bodyText = buildEmailBody();
      // في Netlify سيتم استدعاء Function على هذا المسار
      const res = await fetch('/.netlify/functions/send-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName, bodyText }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'فشل إرسال البريد.');
      }

      setSendSuccess(true);
    } catch (error) {
      setSendError('حدث خطأ أثناء إرسال البريد. حاول مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  const showError =
    hasTriedNext && !canGoNext() && (isNameStep || !!currentQuestion);

  return (
    <div className="app-root">
      <div className="card">
        <div className="header">
          <h1>اختبار الديرما بن والميزوثيرابي</h1>
          <p className="subtitle">
            أجب عن الأسئلة بالترتيب ثم أرسلي النتيجة إلى المدربة عبر البريد.
          </p>
          <div className="progress">
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{
                  width: `${(step / (totalSteps - 1)) * 100}%`,
                }}
              />
            </div>
            <span className="progress-text">
              خطوة {step + 1} من {totalSteps}
            </span>
          </div>
        </div>

        <div className="content">
          {isNameStep && (
            <>
              <h2>اسم المتدرب</h2>
              <p className="helper">
                رجاءً اكتب اسمك الثلاثي قبل البدء في الاختبار.
              </p>
              <input
                type="text"
                className={`text-input ${showError ? 'has-error' : ''}`}
                placeholder="اكتب اسمك هنا"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              {showError && (
                <p className="error-text">من فضلك أدخل اسمك للمتابعة.</p>
              )}
            </>
          )}

          {currentQuestion && (
            <>
              <h2>{currentQuestion.text}</h2>
              <p className="helper">
                اختر الإجابة الصحيحة. يجب اختيار خيار واحد على الأقل للمتابعة.
              </p>
              <div className="options-grid">
                {currentQuestion.options.map((opt, index) => {
                  const selected = answers[currentQuestion.id] === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`option-card ${
                        selected ? 'option-card-selected' : ''
                      } ${showError ? 'option-card-error' : ''}`}
                      onClick={() =>
                        handleAnswerChange(currentQuestion.id, index)
                      }
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {showError && (
                <p className="error-text">
                  رجاءً اختر إجابة قبل الانتقال إلى السؤال التالي.
                </p>
              )}
            </>
          )}

          {isReviewStep && (
            <>
              <h2>مراجعة الإجابات</h2>
              <p className="helper">
                تحقّق من اسمك وإجاباتك. تم إرسال النتيجة تلقائياً إلى البريد
                المسجّل.
              </p>

              <div className="review-block">
                <h3>اسم المتدرب</h3>
                <p>{studentName || 'لم يكتب الاسم'}</p>
              </div>

              <div className="review-block score-block">
                <h3>النتيجة النهائية</h3>
                
                {totalQuestionsWithKey > 0 && (
                  <p className="review-line">
                    <strong>الدرجة : </strong>
                    {markFrom100} / 100
                  </p>
                )}
              </div>

              {QUESTIONS.map((q) => (
                <div key={q.id} className="review-block">
                  <h3>{q.text}</h3>
                  <p className="review-line">
                    <strong>إجابتك: </strong>
                    {typeof answers[q.id] === 'number' ? (
                      <>
                        {q.options[answers[q.id] as number]}
                        {typeof q.correctIndex === 'number' && (
                          <>
                            {answers[q.id] === q.correctIndex ? (
                              <span className="badge badge-correct">
                                صحيحة
                              </span>
                            ) : (
                              <span className="badge badge-wrong">خاطئة</span>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="muted">لا توجد إجابة</span>
                    )}
                  </p>
                  {typeof q.correctIndex === 'number' && (
                    <p className="review-line">
                      <strong>الإجابة الصحيحة: </strong>
                      {q.options[q.correctIndex]}
                    </p>
                  )}
                </div>
              ))}

              {sendSuccess && (
                <p className="helper" style={{ color: '#16a34a' }}>
                  تم إرسال النتائج إلى البريد بنجاح.
                </p>
              )}
              {sendError && (
                <p className="helper" style={{ color: '#b91c1c' }}>
                  {sendError}
                </p>
              )}
            </>
          )}
        </div>

        {!isReviewStep && (
          <div className="footer">
            <button
              type="button"
              className="primary-button full-width"
              onClick={handleNext}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

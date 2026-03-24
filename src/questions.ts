export type McqQuestion = {
  id: number;
  text: string;
  options: string[];
  /**
   * للاستبيانات: اتركها فارغة. للاختبارات ذات إجابة صحيحة: ضع رقم الخيار (0 = الأول، …).
   */
  correctIndex?: number | null;
};

export type RatingNotesQuestion = {
  id: number;
  text: string;
  kind: 'ratingNotes';
};

export type Question = McqQuestion | RatingNotesQuestion;

export function isMcq(q: Question): q is McqQuestion {
  return (q as RatingNotesQuestion).kind !== 'ratingNotes';
}

export function isRatingNotes(q: Question): q is RatingNotesQuestion {
  return (q as RatingNotesQuestion).kind === 'ratingNotes';
}

// عدّل هذا الملف لإضافة أو تغيير أسئلة تقييم الرحلة والخيارات.
// السؤال الأخير: تقييم من 10 + ملاحظات (انظر App.tsx).
export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'هل كانت المواصلات مريحة؟',
    options: ['جيد جداً', 'وسط', 'سيء'],
  },
  {
    id: 2,
    text: 'هل كانت الإقامة في مكة مريحة؟',
    options: ['جيد جداً', 'وسط', 'سيء'],
  },
  {
    id: 3,
    text: 'هل تتمنى أن يكون الوقت أطول بالمدينة أم في مكة؟',
    options: ['في المدينة', 'في مكة'],
  },
  {
    id: 4,
    text: 'هل كانت الإقامة مريحة في المدينة؟',
    options: ['جيد جداً', 'وسط', 'سيء'],
  },
  {
    id: 5,
    text: 'كيف تقييم المزارات؟',
    options: ['جيد جداً', 'وسط', 'سيء'],
  },
  {
    id: 6,
    text: 'هل الوقت كافٍ في مكة؟',
    options: ['نعم', 'لا'],
  },
  {
    id: 7,
    text: 'هل الوقت كافٍ في المدينة؟',
    options: ['نعم', 'لا'],
  },
  {
    id: 8,
    text: 'كيف تقييم جودة المواصلات؟',
    options: ['جيد جداً', 'وسط', 'سيء'],
  },
  {
    id: 9,
    text: 'التقييم العام والملاحظات',
    kind: 'ratingNotes',
  },
];

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Send,
  Star,
  ThumbsUp,
  Heart,
  HelpCircle,
} from 'lucide-react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { User } from '../types/index.ts';
import { LanguageSelector } from './LanguageSelector.tsx';

interface AgriLinkSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onSurveySubmitted?: (rating: string, feedback: string) => void;
}

export const AgriLinkSurveyModal: React.FC<AgriLinkSurveyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSurveySubmitted,
}) => {
  const { t, currentLanguage } = useTranslation();
  const [selectedOptionId, setSelectedOptionId] = useState<string>('completely');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const satisfactionOptions = [
    { id: 'completely', label: t.survey.options.completely, icon: '🌟', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
    { id: 'very', label: t.survey.options.very, icon: '😊', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800' },
    { id: 'somewhat', label: t.survey.options.somewhat, icon: '🙂', color: 'border-blue-300 bg-blue-50/50 text-blue-900' },
    { id: 'slightly', label: t.survey.options.slightly, icon: '😐', color: 'border-amber-300 bg-amber-50/50 text-amber-900' },
    { id: 'not_at_all', label: t.survey.options.notAtAll, icon: '🙁', color: 'border-rose-300 bg-rose-50/50 text-rose-900' },
    { id: 'not_enough', label: t.survey.options.notEnough, icon: '⏳', color: 'border-zinc-300 bg-zinc-50 text-zinc-700' },
  ];

  const currentOption = satisfactionOptions.find((o) => o.id === selectedOptionId) || satisfactionOptions[0];
  const currentSelected = currentOption.label;

  if (!isOpen) return null;

  const handleNext = () => {
    if (!currentSelected) return;
    setStep(2);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          satisfactionRating: `${currentOption.id}: ${currentSelected}`,
          feedbackText: feedbackText.trim(),
          userRole: currentUser?.role || 'GUEST',
          userId: currentUser?.id || null,
          userEmail: currentUser?.email || 'user@agrilink.et',
        }),
      });
    } catch (err) {
      console.warn('Survey POST local fallback:', err);
    } finally {
      setIsSubmitting(false);
      setStep(3);
      if (onSurveySubmitted) {
        onSurveySubmitted(currentSelected, feedbackText);
      }
      localStorage.setItem('agrilink_survey_submitted', 'true');
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSelectedOptionId('completely');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 text-white flex items-center justify-between border-b border-zinc-800 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <img
              src={agrilinkLogo}
              alt="AgriLink Emblem"
              className="h-9 w-9 rounded-xl object-contain bg-white/10 p-0.5 border border-emerald-400/40 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">{t.survey.modalTitle}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t.survey.modalBadge}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{t.survey.modalSubtitle}</p>
            </div>
          </div>

          {/* Right Top Corner: Language Sign / Selector & Close Button */}
          <div className="flex items-center gap-2">
            <LanguageSelector
              variant="pill"
              theme="dark"
              dropdownAlign="right"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {t.survey.step1Indicator}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 leading-snug">
                  {t.survey.step1Title}
                </h3>
                <p className="text-xs text-zinc-500">
                  {t.survey.step1Subtitle}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2.5 pt-1">
                {satisfactionOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{opt.icon}</span>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-950 font-bold' : 'text-zinc-800'}`}>
                          {opt.label}
                        </span>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {t.survey.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
                >
                  <span>{t.survey.nextBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {t.survey.step2Indicator}
                </span>
                <h3 className="text-lg font-black text-zinc-900 leading-snug">
                  {t.survey.step2Title}
                </h3>
                <p className="text-xs text-zinc-500">
                  {t.survey.selectedRatingPrefix} <strong className="text-emerald-700">{currentSelected}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700">
                  {t.survey.feedbackLabel}
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={t.survey.feedbackPlaceholder}
                  className="w-full px-3.5 py-3 rounded-2xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-zinc-800 placeholder-zinc-400 resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  {t.survey.backBtn}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? t.survey.submittingBtn : t.survey.submitBtn}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-900">
                  {t.survey.thankYouTitle}
                </h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                  {currentLanguage === 'am' ? (
                    <>የሰጡን ደረጃ <strong>"{currentSelected}"</strong> {t.survey.thankYouMessage}</>
                  ) : currentLanguage === 'om' ? (
                    <>Sadarkaan <strong>"{currentSelected}"</strong> kennitan {t.survey.thankYouMessage}</>
                  ) : (
                    <>Your rating of <strong>"{currentSelected}"</strong> {t.survey.thankYouMessage}</>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 max-w-sm mx-auto text-left flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {t.survey.supportNotice} <strong>{t.survey.supportPhone}</strong> {currentLanguage === 'am' ? 'ይደውሉ ወይም በUSSD ' : currentLanguage === 'om' ? 'irratti bilbilaa yookiin USSD ' : 'or dial USSD '}<strong>{t.survey.supportUssd}</strong>{currentLanguage === 'am' ? ' ይጠቀሙ።' : currentLanguage === 'om' ? ' fayyadamaa.' : '.'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                {t.survey.doneBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

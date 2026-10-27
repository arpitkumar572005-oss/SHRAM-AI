import React, { useState } from 'react';
import { Star, Award, CheckCircle2, RefreshCw } from 'lucide-react';
import { rateWorker } from '../utils/api';

export default function RatingModal({ worker, onClose, onRatingSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("Excellent work, completed on time with precision.");
  const [contractorName, setContractorName] = useState("Gupta Infrastructure");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await rateWorker({
        worker_id: worker.id,
        contractor_id: "ctr-201",
        contractor_name: contractorName,
        rating,
        review
      });

      if (res.success) {
        setSubmittedResult(res.worker);
        if (onRatingSubmitted) {
          onRatingSubmitted(res.worker);
        }
      }
    } catch (err) {
      console.error("Failed to rate worker:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Award className="h-5 w-5" />
            <span>Mark Gig Complete & Rate Worker</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-semibold">✕</button>
        </div>

        {submittedResult ? (
          <div className="py-6 text-center space-y-3">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Rating & Verification Saved!</h3>
            <p className="text-xs text-slate-400">
              New Average Rating for <b className="text-slate-200">{submittedResult.name}</b>: ⭐ {submittedResult.avg_rating} / 5
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl inline-block text-xs font-bold text-amber-300">
              🏆 Verified Trust Badge: "{submittedResult.trust_badge}"
            </div>
            <button
              onClick={onClose}
              className="block w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl mt-4"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">WORKER DETAILS</span>
              <div className="flex items-center justify-between mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{worker.name}</h4>
                  <p className="text-xs text-amber-400 font-medium">{worker.primary_skill} ({worker.experience_years} yrs exp)</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">
                  {worker.location.village_name}
                </span>
              </div>
            </div>

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rating (1 to 5 Stars):</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700 fill-slate-800'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-amber-400 text-sm">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contractor / Firm Name:</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Written Review / Feedback:</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <Award className="h-4 w-4 text-slate-950" />
                    <span>Submit Rating & Trust Badge</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

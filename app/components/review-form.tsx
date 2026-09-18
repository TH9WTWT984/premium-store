"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type ReviewFormProps = {
  productId: string;
  isLoggedIn: boolean;
};

export default function ReviewForm({ productId, isLoggedIn }: ReviewFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="review-form review-form-gate">
        <div className="review-form-heading">
          <span className="eyebrow">Share your experience</span>
          <h3 className="serif">Loved it? Tell other shoppers.</h3>
          <p>Sign in with the account that purchased this product to leave a verified review.</p>
        </div>
        <Link href="/login" className="btn btn-dark review-submit-button">Log in to review</Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedBody = body.trim();
    const trimmedTitle = title.trim();

    if (trimmedBody.length < 10) {
      setError("Please write at least 10 characters so your review is useful to other shoppers.");
      return;
    }

    if (trimmedBody.length > 2000) {
      setError("Your review must be 2000 characters or fewer.");
      return;
    }

    if (trimmedTitle.length > 120) {
      setError("Your title must be 120 characters or fewer.");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle || undefined,
          body: trimmedBody,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to submit your review.");
      }

      setStatus("success");
      setTitle("");
      setBody("");
    } catch (submissionError) {
      setStatus("idle");
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit your review.");
    }
  }

  if (status === "success") {
    return (
      <div className="review-form review-success">
        <div className="review-success-mark" aria-hidden="true">✓</div>
        <div>
          <div className="eyebrow">Review submitted</div>
          <h3 className="serif">Thank you for sharing.</h3>
          <p>Your review is now with our moderation team. Once approved, it will appear on the product page.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="review-form review-form-card" onSubmit={handleSubmit}>
      <div className="review-form-heading">
        <span className="eyebrow">Verified purchaser review</span>
        <h3 className="serif">Tell us what you thought</h3>
        <p>Your honest feedback helps other shoppers choose with confidence.</p>
      </div>

      <div className="review-form-grid">
        <label className="review-field">
          <span className="review-field-label">Title <em>Optional</em></span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="What stood out?"
          />
        </label>

        <label className="review-field review-body-field">
          <span className="review-field-label">Your review</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            minLength={10}
            maxLength={2000}
            rows={6}
            placeholder="Share the fit, quality, finish, or overall experience."
            required
          />
          <span className="review-character-count">{body.length}/2000</span>
        </label>
      </div>

      {error && <p className="review-error" role="alert">{error}</p>}

      <div className="review-form-footer">
        <button className="btn btn-dark review-submit-button" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting…" : "Publish review"}
        </button>
        <p className="review-note">Verified-purchase reviews are moderated before publication.</p>
      </div>
    </form>
  );
}

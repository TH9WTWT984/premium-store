export default function ReviewStyles() {
  return (
    <style>{`
      .premium-reviews-section {
        margin-top: 56px;
        padding-top: 38px;
        border-top: 1px solid rgba(20, 20, 20, 0.12);
      }

      .premium-reviews-section > h2 {
        margin: 8px 0 26px;
        font-size: clamp(2rem, 3vw, 2.8rem);
        letter-spacing: -0.025em;
      }

      .review-list {
        display: grid;
        gap: 14px;
        margin-bottom: 28px;
      }

      .review-card {
        padding: 22px 24px;
        border: 1px solid rgba(20, 20, 20, 0.11);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.58);
        box-shadow: 0 10px 30px rgba(20, 20, 20, 0.04);
      }

      .review-card .review-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .review-card .review-head > div:first-child {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .review-card h3 {
        margin: 13px 0 7px;
        font-size: 1.08rem;
      }

      .review-card p {
        margin: 0;
        line-height: 1.7;
        color: rgba(20, 20, 20, 0.72);
      }

      

      

      .review-verified-badge {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        padding: 3px 8px;
        border: 1px solid rgba(20, 20, 20, 0.12);
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(20, 20, 20, 0.62);
        background: rgba(20, 20, 20, 0.035);
      }

      .review-empty-state {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;
        padding: 20px 22px;
        border: 1px dashed rgba(20, 20, 20, 0.16);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.38);
      }

      .review-empty-icon {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        flex: 0 0 40px;
        border-radius: 50%;
        background: rgba(20, 20, 20, 0.055);
        font-size: 1rem;
      }

      .review-empty-title {
        margin: 0 0 4px;
        font-size: 1rem;
      }

      .review-empty-state p {
        margin: 0;
        color: rgba(20, 20, 20, 0.62);
        font-size: 0.92rem;
      }

      .review-form {
        width: 100%;
        box-sizing: border-box;
        margin-top: 24px;
        padding: clamp(22px, 4vw, 32px);
        border: 1px solid rgba(20, 20, 20, 0.11);
        border-radius: 20px;
        background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,247,243,0.78));
        box-shadow: 0 18px 50px rgba(20, 20, 20, 0.055);
      }

      .review-form-heading {
        max-width: 560px;
        margin-bottom: 24px;
      }

      .review-form-heading h3 {
        margin: 7px 0 8px;
        font-size: clamp(1.45rem, 2.8vw, 1.9rem);
        letter-spacing: -0.018em;
      }

      .review-form-heading p,
      .review-form-gate p,
      .review-success p {
        margin: 0;
        line-height: 1.65;
        color: rgba(20, 20, 20, 0.66);
      }

      

      .review-field-label {
        display: flex;
        align-items: baseline;
        gap: 5px;
        margin-bottom: 9px;
        font-size: 0.78rem;
        font-weight: 650;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(20,20,20,0.67);
      }

      .review-field-label em {
        font-style: normal;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
        color: rgba(20,20,20,0.42);
      }

      

      

      

      

      

      

      .review-form-grid {
        display: grid;
        gap: 18px;
        margin-top: 22px;
      }

      .review-field {
        position: relative;
        display: block;
      }

      .review-field input,
      .review-field textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(20,20,20,0.14);
        border-radius: 12px;
        background: rgba(255,255,255,0.9);
        color: #1b1b1b;
        font: inherit;
        font-size: 0.98rem;
        outline: none;
        transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
      }

      .review-field input {
        min-height: 50px;
        padding: 0 15px;
      }

      .review-field textarea {
        min-height: 150px;
        padding: 14px 15px;
        resize: vertical;
        line-height: 1.6;
      }

      .review-field input::placeholder,
      .review-field textarea::placeholder {
        color: rgba(20,20,20,0.38);
      }

      .review-field input:focus,
      .review-field textarea:focus {
        border-color: rgba(20,20,20,0.46);
        background: #fff;
        box-shadow: 0 0 0 4px rgba(20,20,20,0.055);
      }

      .review-character-count {
        display: block;
        margin-top: 7px;
        text-align: right;
        font-size: 0.74rem;
        color: rgba(20,20,20,0.4);
      }

      .review-error {
        margin: 16px 0 0;
        padding: 11px 13px;
        border: 1px solid rgba(130, 40, 40, 0.16);
        border-radius: 10px;
        background: rgba(130, 40, 40, 0.05);
        color: #752d2d;
        font-size: 0.88rem;
        line-height: 1.5;
      }

      .review-form-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-top: 20px;
      }

      .review-submit-button {
        min-width: 158px;
        justify-content: center;
        padding-inline: 22px;
      }

      .review-submit-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .review-note {
        margin: 0;
        max-width: 310px;
        font-size: 0.78rem;
        line-height: 1.45;
        color: rgba(20,20,20,0.48);
        text-align: right;
      }

      .review-form-gate,
      .review-success {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .review-success {
        background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,248,245,0.9));
      }

      .review-success-mark {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        border-radius: 50%;
        background: #1b1b1b;
        color: white;
        font-size: 1rem;
        font-weight: 700;
      }

      .review-success > div:last-child {
        flex: 1;
      }

      .review-success h3 {
        margin: 6px 0 7px;
        font-size: 1.35rem;
      }


      .product-review-summary 


      @media (max-width: 640px) {
        .premium-reviews-section {
          margin-top: 42px;
          padding-top: 30px;
        }

        .review-card {
          padding: 18px;
          border-radius: 14px;
        }

        .review-card .review-head {
          flex-direction: column;
          gap: 9px;
        }

        .review-empty-state {
          padding: 17px;
        }

        .review-form {
          padding: 20px;
          border-radius: 16px;
        }

        

        .review-form-footer,
        .review-form-gate,
        .review-success {
          align-items: stretch;
          flex-direction: column;
        }

        .review-submit-button {
          width: 100%;
        }

        .review-note {
          max-width: none;
          text-align: left;
        }
      }
    `}</style>
  );
}

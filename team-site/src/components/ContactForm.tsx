import { type FormEvent, useState } from 'react';
import { Mail, Send } from 'lucide-react';

type SubmitState = 'idle' | 'sending' | 'success' | 'error' | 'unconfigured';

const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

export function ContactForm() {
  const [state, setState] = useState<SubmitState>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessKey) {
      setState('unconfigured');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('access_key', accessKey);

    setState('sending');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setState('success');
        form.reset();
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  return (
    <section className="panel contactPanel" id="contact" aria-label="Contact support">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Support</p>
          <h2>Contact the judges</h2>
        </div>
        <Mail size={22} />
      </div>

      <form className="contactForm" onSubmit={handleSubmit}>
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="honeypot" />
        <input type="hidden" name="subject" value="New message from the Deploy Sprint team site" />

        <label className="contactField">
          <span>Name</span>
          <input type="text" name="name" required autoComplete="name" />
        </label>

        <label className="contactField">
          <span>Email</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>

        <label className="contactField">
          <span>Message</span>
          <textarea name="message" rows={4} required />
        </label>

        <button type="submit" className="contactSubmit" disabled={state === 'sending'}>
          <Send size={16} />
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        <p className="contactStatus" role="status">
          {state === 'success' && 'Message sent — thanks for reaching out.'}
          {state === 'error' && 'Something went wrong sending your message. Please try again.'}
          {state === 'unconfigured' &&
            'Contact form is not configured in this environment (missing Web3Forms access key).'}
        </p>
      </form>
    </section>
  );
}

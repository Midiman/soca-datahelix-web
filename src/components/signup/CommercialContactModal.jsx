import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { Spinner } from '@hct/soca-toolkit';

import { searchService } from '../../_services/search.service';
import { maskEmail } from '../../util/email';


const INITIAL_FORM = {
    name: '',
    company: '',
    email: '',
    message: ''
};

const MODAL_ANIMATION_MS = 520;


const CommercialContactModal = ({
    open,
    interest = 'ThreatLab commercial services',
    onClose = null
}) =>
{
    const [form, setForm] = useState(INITIAL_FORM);
    const [busy, setBusy] = useState(false);
    const [alert, setAlert] = useState(null);
    const [sent, setSent] = useState(false);
    const [rendered, setRendered] = useState(open);
    const [animationState, setAnimationState] = useState(
        open ? 'opening' : 'closed'
    );


    useEffect(() =>
    {
        let timer = null;

        if (open)
        {
            setRendered(true);
            setAnimationState('opening');

            timer = window.setTimeout(() =>
                setAnimationState('open'), MODAL_ANIMATION_MS);
        }
        else if (rendered)
        {
            setAnimationState('closing');

            timer = window.setTimeout(() =>
            {
                setRendered(false);
                setAnimationState('closed');
                setForm(INITIAL_FORM);
                setBusy(false);
                setAlert(null);
                setSent(false);
            }, MODAL_ANIMATION_MS);
        }

        return () =>
        {
            if (timer)
                window.clearTimeout(timer);
        };
    }, [open]);


    useEffect(() =>
    {
        if (!open)
            return undefined;

        function handleKeyDown(event)
        {
            if (event.key === 'Escape' && !busy)
                requestClose();
        }

        window.addEventListener('keydown', handleKeyDown);

        return () =>
            window.removeEventListener('keydown', handleKeyDown);
    }, [open, busy, onClose]);


    function requestClose()
    {
        if (busy || animationState === 'closing')
            return;

        setAnimationState('closing');
        onClose?.();
    }


    function updateField(name, value)
    {
        setForm(current => ({
            ...current,
            [name]: value
        }));

        setAlert(null);
    }


    function validate()
    {
        if (!form.name.trim())
            return 'Please enter your name.';

        if (!form.company.trim())
            return 'Please enter your company name.';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
            return 'Please enter a valid work email address.';

        if (!form.message.trim())
            return 'Please tell us briefly what you would like to achieve.';

        return null;
    }


    async function submit(event)
    {
        event.preventDefault();

        if (busy)
            return;

        const validationError = validate();

        if (validationError)
        {
            setAlert(validationError);
            return;
        }

        setBusy(true);
        setAlert(null);

        try
        {
            const response = await searchService.createThreatLabContactRequest({
                name: form.name.trim(),
                company: form.company.trim(),
                email: form.email.trim().toLowerCase(),
                interest,
                message: form.message.trim()
            });

            if (
                !response ||
                response?.ok === false ||
                response?.status >= 400 ||
                response?.error
            )
            {
                throw new Error(
                    response?.error ||
                    response?.message ||
                    'We have been unable to send your message. Please check the email address is a valid business email.'
                );
            }

            setSent(true);
        }
        catch (err)
        {
            if (Debug)
                console.error('ThreatLab Upgrade contact error', err);
            setAlert(err?.message || 'We have been unable to send your message. Please check the email address is a valid business email.');
        }
        finally
        {
            setBusy(false);
        }
    }

    if (!rendered)
        return null;

    return (
        <div
            className={`streaming-contact-modal-backdrop ${animationState}`}
            role="presentation"
            onMouseDown={(event) =>
            {
                if (event.target === event.currentTarget && !busy)
                    requestClose();
            }}
        >
            <section
                className="streaming-contact-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="streaming-contact-modal-title"
            >
                <button
                    type="button"
                    className="streaming-contact-close"
                    onClick={requestClose}
                    disabled={busy}
                    aria-label="Close contact form"
                >
                    <FaTimes aria-hidden="true" />
                </button>

                {!sent
                    ?
                    <>
                        <div className="streaming-contact-heading">
                            <div className="streaming-contact-kicker">Commercial enquiry</div>
                            <h2 id="streaming-contact-modal-title">Plan your deployment</h2>
                            <p>{interest}</p>
                        </div>

                        <form className="streaming-contact-form" onSubmit={submit}>
                            <div className="streaming-contact-grid">
                                <label>
                                    <span>Name</span>
                                    <input
                                        type="text"
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={event => updateField('name', event.target.value)}
                                        autoFocus
                                    />
                                </label>

                                <label>
                                    <span>Company</span>
                                    <input
                                        type="text"
                                        autoComplete="organization"
                                        value={form.company}
                                        onChange={event => updateField('company', event.target.value)}
                                    />
                                </label>
                            </div>

                            <label>
                                <span>Email</span>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={event => updateField('email', event.target.value)}
                                />
                            </label>

                            <label>
                                <span>Tell us about your requirements</span>
                                <textarea
                                    rows={5}
                                    value={form.message}
                                    onChange={event => updateField('message', event.target.value)}
                                    // placeholder="Tell us about your data sources, expected volume, environment, or the managed service you need."
                                    // Tell us what you need to connect, protect or automate, and we'll help scope the right deployment.
                                    placeholder="Tell us about what you need to connect, protect and automate, and we'll help scope the right deployment."
                                />
                            </label>

                            <div className="streaming-contact-alert" aria-live="polite">
                                {alert || ''}
                            </div>

                            <Button
                                type="submit"
                                className="streaming-contact-submit"
                                disabled={busy}
                            >
                                <FaPaperPlane aria-hidden="true" />
                                {busy
                                    ?
                                    <span style={{display:'inline-block',width:'100%'}}>
                                        Sending <Spinner style={{display:'inline'}} size={11} color="#EEE"/>
                                    </span>
                                    :
                                    'Send message'
                                }
                            </Button>
                        </form>
                    </>
                    :
                    <div className="streaming-contact-success">
                        <div className="streaming-contact-kicker">Message sent</div>
                        <h2 id="streaming-contact-modal-title">Thank you for your message!</h2>
                        <p>
                            We'll be in touch with you shortly to handle your request.
                        </p>

                        <Button
                            type="button"
                            className="streaming-contact-submit"
                            onClick={requestClose}
                        >
                            Close
                        </Button>
                    </div>
                }
            </section>
        </div>
    );
};


export { CommercialContactModal };

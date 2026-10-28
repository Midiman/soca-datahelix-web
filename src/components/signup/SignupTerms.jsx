import React, { useEffect, useState } from 'react';

import { Button, Modal } from 'react-bootstrap';


const MODAL_ANIMATION_MS = 520;


const SignupTerms = ({
    show,
    termsVersion,
    onHide
}) =>
{
    const [rendered, setRendered] = useState(show);
    const [animationState, setAnimationState] = useState(
        show ? 'opening' : 'closed'
    );


    useEffect(() =>
    {
        let timer = null;

        if (show)
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
            }, MODAL_ANIMATION_MS);
        }

        return () =>
        {
            if (timer)
                window.clearTimeout(timer);
        };
    }, [show]);


    function requestClose()
    {
        if (animationState === 'closing')
            return;

        setAnimationState('closing');
        onHide?.();
    }


    return (
        <Modal
            show={rendered}
            onHide={requestClose}
            centered
            size="lg"
            animation={false}
            className={`signup-terms-modal-root ${animationState}`}
            dialogClassName={`signup-terms-modal ${animationState}`}
        >
            <Modal.Header closeButton>
                <div>
                    <div className="signup-eyebrow">Version {termsVersion}</div>
                    <Modal.Title>ThreatLab Terms and Conditions</Modal.Title>
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="signup-terms-placeholder">
                    <h2>Insert approved EULA / Terms here</h2>
                    <p>
                        Replace this block with the approved ThreatLab legal terms.
                        The signup flow records the accepted terms version when the
                        account is created.
                    </p>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    type="button"
                    className="signup-secondary-button"
                    onClick={requestClose}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


export { SignupTerms };

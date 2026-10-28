import React from 'react';

import { Button } from 'react-bootstrap';
import { DefaultBranding } from '../DefaultBranding';


const SignupComplete = ({
    onLogin
}) =>
{
    return (
        <main className="signup-stage-page signup-centered-stage">
            <section className="signup-complete-card">
                <div className="signup-stage-brand">
                    <DefaultBranding orientation="horizontal" />
                </div>

                <div className="signup-stage-heading centered">
                    <h3>Success!</h3>
                    <p>Your ThreatLab account is set up and ready to use.</p>
                </div>

                <Button
                    autoFocus={true}
                    type="button"
                    className="signup-primary-button"
                    onClick={onLogin}
                >
                    Sign in to ThreatLab
                </Button>
            </section>
        </main>
    );
};

export { SignupComplete };

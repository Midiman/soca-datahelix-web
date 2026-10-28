import React, { useEffect, useRef, useState } from 'react';
import { Drawer } from '@mui/material';
import {
    FaArrowLeft,
    FaArrowUp,
    FaClock,
    FaHeadset,
    FaHistory,
    FaKey,
    FaNetworkWired,
    FaPaperPlane,
    FaShieldAlt,
    FaSignOutAlt,
    FaTimes,
    FaTrashAlt,
    FaUserCircle
} from 'react-icons/fa';
import { IoIosWarning } from "react-icons/io";
import { Debug } from '@/util/Utilities';


const ProfileDrawer = ({
    open = false,
    onClose,
    user = null,
    historyItems = [],
    onLogin,
    onSignup,
    onUpgrade,
    onSecurity,
    onLogout,
    onDeleteAccount,
    onSupportRequest
}) =>
{
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [supportOpen, setSupportOpen] = useState(false);
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [supportBusy, setSupportBusy] = useState(false);
    const [supportStatus, setSupportStatus] = useState(null);
    const deleteConfirmRef = useRef(null);

    const email = user?.email || null;
    const isGuest = !email;
    const company = user?.companyName || user?.company || user?.organisation || null;
    const plan = isGuest ? 'Guest' : (user?.plan || user?.subscription || 'Free');
    const planId = getPlanId(plan);
    const isPaidPlan = !isGuest && planId !== 'free' && planId !== 'guest';
    const canUpgrade = !isGuest && ['free', 'business', 'pro'].includes(planId);
    const mfaEnabled = user?.mfaMechanism && user?.mfaMechanism.lenght > 0;

    const profileScrollRef = useRef(null);    

    if (Debug)
        console.log('ProfileDrawer ENTRY user: ', user)

    useEffect(() =>
    {
        if (open)
            return;

        setDeleteConfirm(false);
        setDeleteBusy(false);
        setDeleteError(null);
        setSupportOpen(false);
        setSupportBusy(false);
        setSupportStatus(null);
    }, [open]);


    useEffect(() =>
    {
        if (!deleteConfirm)
            return;

        window.requestAnimationFrame(() =>
        {
            window.requestAnimationFrame(() =>
            {
                const element = profileScrollRef.current;

                if (element)
                    element.scrollTop = element.scrollHeight;
            });
        });
    }, [deleteConfirm]);

    function getPlanId(value)
    {
        if (!value)
            return 'free';

        if (typeof value === 'string')
            return value.trim().toLowerCase();

        return String(
            value.id || value.plan || value.name || 'free'
        ).trim().toLowerCase();
    }


    function getPlanLabel()
    {
        if (typeof plan === 'string')
            return plan;

        return plan?.name || plan?.id || 'Free';
    }


    function getMFAStatus()
    {
        if (isGuest)
            return '-';

        const mechanism = String(user?.mfaMechanism || '').trim().toLowerCase();

        if (mechanism === 'totp')
            return 'Authenticator';

        if (mechanism === 'passkey')
            return 'Passkey';

        if (mfaEnabled === true)
            return 'Enabled';

        if (mfaEnabled === false || mechanism === 'none')
            return 'Not enabled';

        return '-';
    }


    function handleLoginClick()
    {
        onClose?.();
        onLogin?.();
    }


    function handleSignupClick()
    {
        onClose?.();
        onSignup?.();
    }


    function handleUpgradeClick()
    {
        onClose?.();
        onUpgrade?.();
    }


    function handleSecurityClick()
    {
        onClose?.();
        onSecurity?.();
    }


    function handleLogoutClick()
    {
        onLogout?.();
    }


    async function handleDeleteConfirm()
    {
        setDeleteBusy(true);
        setDeleteError(null);

        try
        {
            const response = await onDeleteAccount?.({
                planId,
                isPaidPlan
            });

            if (response?.ok === false || response?.status >= 400 || response?.error)
                throw new Error(response?.error || response?.message || 'Unable to delete account.');

            setDeleteConfirm(false);
        }
        catch (err)
        {
            setDeleteError(err?.message || 'Unable to delete account.');
        }
        finally
        {
            setDeleteBusy(false);
        }
    }


    async function handleSupportSubmit(event)
    {
        event.preventDefault();

        if (!supportSubject.trim() || !supportMessage.trim())
            return;

        setSupportBusy(true);
        setSupportStatus(null);

        try
        {
            const response = await onSupportRequest?.({
                subject: supportSubject.trim(),
                message: supportMessage.trim()
            });

            if (response?.ok === false || response?.status >= 400 || response?.error)
                throw new Error(response?.error || response?.message || 'Unable to send support request.');

            setSupportSubject('');
            setSupportMessage('');
            setSupportStatus('Support request sent.');
        }
        catch (err)
        {
            setSupportStatus(err?.message || 'Unable to send support request.');
        }
        finally
        {
            setSupportBusy(false);
        }
    }


    function renderProfileRow(label, value)
    {
        return (
            <div className="profile-drawer-row">
                <span className="profile-drawer-label">{label}</span>
                <span className="profile-drawer-value">{value || '-'}</span>
            </div>
        );
    }


    function renderHistory()
    {
        if (isGuest)
        {
            return (
                <div className="profile-history-empty">
                    Sign in to keep and revisit your ThreatLab analysis history.
                </div>
            );
        }

        if (!historyItems.length)
        {
            return (
                <div className="profile-history-empty">
                    Your recent analyses will appear here.
                </div>
            );
        }

        return (
            <div className="profile-history-list">
                {historyItems.slice(0, 8).map((item, index) => (
                    <button
                        key={item.id || index}
                        type="button"
                        className="profile-history-item"
                        onClick={item.onClick}
                    >
                        <FaClock aria-hidden="true" />
                        <span>
                            <strong>{item.title || item.label || 'Threat analysis'}</strong>
                            {item.timestamp && <small>{item.timestamp}</small>}
                        </span>
                    </button>
                ))}
            </div>
        );
    }


    function renderSupport()
    {
        if (!isPaidPlan)
            return null;

        return (
            <div className="profile-drawer-section profile-support-section">
                <button
                    type="button"
                    className="profile-drawer-action"
                    onClick={() => setSupportOpen(current => !current)}
                >
                    <FaHeadset aria-hidden="true" />
                    <span>
                        <strong>Support request</strong>
                        <small>Contact ThreatLab support</small>
                    </span>
                </button>

                {supportOpen && (
                    <form className="profile-support-form" onSubmit={handleSupportSubmit}>
                        <input
                            type="text"
                            value={supportSubject}
                            onChange={event => setSupportSubject(event.target.value)}
                            placeholder="Subject"
                            maxLength={120}
                            required
                        />

                        <textarea
                            value={supportMessage}
                            onChange={event => setSupportMessage(event.target.value)}
                            placeholder="How can we help?"
                            rows={4}
                            maxLength={4000}
                            required
                        />

                        <button
                            type="submit"
                            className="profile-support-submit"
                            disabled={supportBusy}
                        >
                            <FaPaperPlane aria-hidden="true" />
                            {supportBusy ? 'Sending...' : 'Send request'}
                        </button>

                        {supportStatus && (
                            <div className="profile-support-status">{supportStatus}</div>
                        )}
                    </form>
                )}
            </div>
        );
    }


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
                className: 'profile-drawer-paper',
                ref: profileScrollRef
            }}
        >
            <div className="profile-drawer-header">
                <div className="profile-drawer-eyebrow"><span>THREAT</span>LAB</div>

                <button
                    type="button"
                    className="profile-drawer-close"
                    onClick={onClose}
                    aria-label="Close ThreatLab menu"
                >
                    <FaArrowLeft aria-hidden="true" />
                    Back
                </button>
            </div>

            <div className="profile-drawer-account">
                <FaUserCircle className="profile-drawer-avatar" />

                <div className="profile-drawer-account-copy">
                    <div className="profile-drawer-name">
                        {isGuest ? 'Guest' : email}
                    </div>
                </div>
            </div>

            {isGuest
                ?
                <div className="profile-drawer-auth">
                    <div className="profile-drawer-auth-copy">
                        <strong>Already have an account?</strong>
                        <span>Sign in to use your account allowance and saved activity.</span>
                    </div>

                    <button
                        type="button"
                        className="profile-drawer-login"
                        onClick={handleLoginClick}
                    >
                        Sign in
                    </button>

                    <button
                        type="button"
                        className="profile-drawer-signup"
                        onClick={handleSignupClick}
                    >
                        Create free account
                    </button>
                </div>
                :
                <>
                    <div className="profile-drawer-section">
                        <div className="profile-drawer-section-title">
                            <FaShieldAlt />
                            Account
                        </div>

                        {/* {renderProfileRow('Email', maskEmail(email))} */}
                        {renderProfileRow('Organisation', company)}
                        {renderProfileRow('Plan', getPlanLabel())}
                        {renderProfileRow('MFA', getMFAStatus())}
                    </div>

                    <div className="profile-drawer-section profile-actions-section">
                        {/* ACCOUNT SECURITY */}
                        <button
                            type="button"
                            className="profile-drawer-action mt-2"
                            onClick={handleSecurityClick}
                        >
                            <FaKey aria-hidden="true" />
                            <span>
                                <strong>Account Security</strong>
                                <small>Change your credentials</small>
                            </span>
                        </button>
                    </div>

                    {canUpgrade && (
                        <div className="profile-drawer-section profile-actions-section">
                            <button
                                type="button"
                                className="profile-drawer-action profile-upgrade-action"
                                onClick={handleUpgradeClick}
                            >
                                <FaArrowUp aria-hidden="true" />
                                <span>
                                    <strong>Upgrade</strong>
                                    {/* <small>See plans above your current level</small> */}
                                </span>
                            </button>
                        </div>
                    )}
                </>
            }

            {renderSupport()}

            {/* <div className="profile-drawer-section profile-history-section">
                <div className="profile-drawer-section-title">
                    <FaHistory />
                    Analysis history
                </div>

                {renderHistory()}
            </div> */}

            {!isGuest && (
                <div className="profile-drawer-footer">
                    <button
                        type="button"
                        className="profile-drawer-logout"
                        onClick={handleLogoutClick}
                    >
                        <FaSignOutAlt aria-hidden="true" />
                        Sign out
                    </button>

                    {!deleteConfirm
                        ?
                        <button
                            type="button"
                            className="profile-drawer-delete"
                            onClick={() => setDeleteConfirm(true)}
                        >
                            <FaTrashAlt aria-hidden="true" />
                            Delete account
                        </button>
                        :
                        <div ref={deleteConfirmRef} className="profile-delete-confirm">
                            <strong className='pb-2'>Are sure you want to delete this account?</strong>
                            <div style={{
                                backgroundColor: 'rgba(159, 103, 0, 0.4)',
                                marginTop:'10px',
                                padding: '0.5rem',
                                borderRadius: '4px',                 
                                }}>
                                <h2 style={{fontSize: '0.9rem'}}><IoIosWarning /> Warning</h2>
                                <p>This operation cannot be undone!</p>
                            </div>   
                            
                            {/* <p>
                                {isPaidPlan
                                    ? 'Access will be disabled and the account scheduled for deletion after the current paid term ends.'
                                    : 'Access will be disabled and the account scheduled for deletion.'
                                }
                            </p> */}
                            {isPaidPlan && (
                                <small>
                                    Contact support if you need the account reinstated before deletion.
                                </small>
                            )}

                            {deleteError && (
                                <div className="profile-delete-error">{deleteError}</div>
                            )}

                            <div className="profile-delete-actions">
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(false)}
                                    disabled={deleteBusy}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="danger"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteBusy}
                                >
                                    {deleteBusy ? 'Deleting...' : 'Delete account'}
                                </button>
                            </div>
                        </div>
                    }
                </div>
            )}


        </Drawer>
    );
};

export { ProfileDrawer };

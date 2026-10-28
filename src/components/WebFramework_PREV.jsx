import React, { useState, useEffect, useContext, useMemo, lazy, Suspense } from 'react';
import { Container, Card, Row, Col, Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Collapse } from "@mui/material";

import { FaExpand, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { DefaultBranding } from './DefaultBranding';
import { Signup } from './signup/Signup';
import { AuthPage } from './auth/AuthPage';
import { ThoughtLeadershipBoard } from './ThoughtLeadershipBoard';
import { SOCAChatbotWrapper } from '@hct/soca-chatbot';
import { Debug, SetDebug } from '@/util/Utilities';

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.addLocale(en);


const WebFramework = (props) => 
{
    const [authMode, setAuthMode] = useState(initAuthMode());
    const [showThoughtLeadership, setShowThoughtLeadership] = useState(true);


//  if (Debug)
        console.log('WebFramework ENTRY ', Debug)

    function initAuthMode()
    {
        const am = localStorage.getItem('_am');
        if (Debug)
            console.log('WebFramework initAuthMode ' + am)
        if (am == null || am.trim().length == 0)
            return null;
        if (am != 'login' && am != 'signup')
            return null;
        return am.toLowerCase();
    }

    function toggleThoughtLeadership()
    {
        setShowThoughtLeadership(current => !current);
    }

    if (Debug)
        console.log('WebFramework ENTRY')


    const defaultLogo = <DefaultBranding orientation="horizontal"/>


    function renderChatBot()
    {
        return (
            <>
                <SOCAChatbotWrapper prompterInvisible={false} />
            </>
        )
    }

    function renderBody()
    {
//        if (Debug)
            console.log('renderBody rsb? ' + window.RIGHT_SIDEBAR);
        return (
            <Row className='body'>
                {
                    window.LEFT_SIDEBAR == 'true' &&
                    <Col sm={2} className='left-sidebar'>
                        {renderLeftSidebar()}
                    </Col>
                }

                <Col className="chatbot-col" style={{ minHeight: 0 }}>
                    {renderChatBot()}
                    {/* <div>WebFramework Body</div> */}
                </Col>

                {
                    window.RIGHT_SIDEBAR == 'true' &&
                    <div className="thought-leadership-shell">

                        <Button
                            type="button"
                            className="thought-leadership-toggle"
                            onClick={toggleThoughtLeadership}
                            title={showThoughtLeadership ? 'Hide Cyber Intelligence feed' : 'Show Cyber Intelligence feed'}
                        >
                            {showThoughtLeadership ? <FaArrowRight size={15}/> : <FaArrowLeft size={15}/>}
                        </Button>

                        <Collapse
                            orientation="horizontal"
                            in={showThoughtLeadership}
                            timeout={{ appear: 0, enter: 800, exit: 1000}}
                        >
                            <div className="thought-leadership-sidebar">
                                <ThoughtLeadershipBoard />
                            </div>
                        </Collapse>

                    </div>
                }


                {/* {
                    window.RIGHT_SIDEBAR == 'true' &&
                    <Col sm={2} className='right-sidebar'>
                        {renderRightSidebar()}
                    </Col>
    } */}
            </Row>
        )
    }

    function renderLeftSidebar()
    {
        return (
            <div className="d-flex flex-column flex-grow-1 h-100">
                <Row className='svc-ad'>
                    <Col className="h-100 d-flex flex-column">WebFramework LEFT SIDEBAR Ad</Col>
                </Row>
                <Row className='svc-ad'>
                    <Col className="h-100 d-flex flex-column">Left SB ad</Col>
                </Row>
            </div>
        )
    }

    // function renderRightSidebar()
    // {
    //     return (
    //         <div className="d-flex flex-column flex-grow-1 h-100 mt-2">
    //             {/* <Row className='no-ads-cta'>
    //                 <div>Don't like ads? <Button className='btn-cta'>Sign Up</Button></div>
    //             </Row> */}
    //             <Row className='svc-card'>
    //                 {/* <Col className="h-100 d-flex flex-column">WebFramework RIGHT SIDEBAR Ad</Col> */}
    //                 <Col>
    //                     <img src='/images/NCSC-bulletin-card.png'/>
    //                 </Col>
    //             </Row>
    //             <Row className='svc-card'>
    //                 {/* <Col className="h-100 d-flex flex-column">Right SB ad</Col> */}
    //                 <Col>
    //                     <img src='/images/NCSC-bulletin-card-2.png'/>
    //                 </Col>
    //             </Row>
    //         </div>
    //     )
    // }

    function howItWorksClick()
    {
//        if (Debug)
            console.log('howItWorksClick ENTRY')

//TODO

    }

    function upgradeClick()
    {
//        if (Debug)
            console.log('upgradeClick ENTRY')

//TODO

    }

    function renderMenu()
    {
        return (
            <div className='ms-auto'>
                {/* <button>Analyze</button> */}
                {/* <Button onClick={() => howItWorksClick()}>How it works</Button> */}
                {/* <button>Cyber World</button> */}
                {/* <Button onClick={() => upgradeClick()}>Upgrade</Button> */}
            </div>
        )
    }

    function renderHeader()
    {
        return (
            <Row className='header'>
                <Col sm={2} className='branding mx-2'>{defaultLogo}</Col>
                <Col className='menu'>{renderMenu()}</Col>
            </Row>
        )
    }

    function onCTAClick()
    {
//        if (Debug)
            console.log('WebFramework onCTAClick() ENTRY')

        const url = 'https://socautomation.com/contact';
        window.open(url, '_blank').focus();

    }

    function onLoginClick(onLogin = false)
    {
//      if (Debug)
            console.log('WebFramework onLoginClick() ENTRY', onLogin)
        setAuthMode(onLogin == true ? 'login' : 'signup');
    }

    function renderFooter()
    {
        return (
            <Row className="footer">
                <Col className="footer-content" onClick={onLoginClick}>
                    <div className='soca-cta'>
                        <div className='footer-copy'>Detect real-time Threat Actors at scale? → It's time for the Automated AI SOC</div>
                        {/* <div className='footer-copy'>Want all your events analyzed automatically?<br/>Try SOCAutomation's Automated SOC Service for free!</div> */}
                        <Button className='btn-cta' onClick={onLoginClick}>Sign Up</Button>
                    </div>
                </Col>
            </Row>
        );
    }


    function XXXrenderFooter()
    {
        return (
            <>
                <Row className='soca-cta'>
                    <Button className='btn-cta' onClick={onCTAClick}>Want all your events analyzed automatically?<br/>Try SOCAutomation's Automated SOC Service for free!</Button>
                </Row>
                <Row className='footer'>
                    <Row className='contact'>
                        {/* <Col></Col> */}
                    </Row>
                </Row>
            </>
        )
    }

    /**
     * render
     */
    if (authMode)
    {
//      if (Debug)
            console.log('WebFramework render AUTHMODE', authMode)
        return (
            <>
            {
                authMode == 'login'
                ?
                <AuthPage
                    initialMode={authMode}
                    onAuthenticated={(response) =>
                    {
                        console.log('Authenticated', response);

                        setAuthMode(null);

                        // Whatever you already do after successful authentication
                        // e.g. set user/token/state/etc.
                    }}
                />
                :
                <Signup/>
            }
            </>
        );
    }
//  if (Debug)
        console.log('WebFramework render PageMODE', authMode)

    return (
        <Container
            fluid
            className="datahelix-web-app outer-container main-layout"
        >
            <div className='main-content'>
                    {renderHeader()}
                    {renderBody()}
                    {renderFooter()}
            </div>

            {/* <Collapse
                orientation="horizontal"
                in={showThoughtLeadership}
                timeout={250}
            >
                <div className="thought-leadership-sidebar">
                    <ThoughtLeadershipBoard />
                </div>
            </Collapse> */}
        </Container>
    )


    // return (
    //     <Container
    //         fluid
    //         className="datahelix-web-app outer-container"
    //     >
    //         {renderHeader()}
    //         {renderBody()}
    //         {renderFooter()}
    //     </Container>
    // )

}
export default WebFramework;



import React, { useState } from 'react';
import { slide as Menu, main } from 'react-burger-menu'
//import '../css/burgermenu.css';
import { CommercialContactModal } from '../components/signup/CommercialContactModal';


const BurgerMenu = (props, handleChange) => {
    const [showCommercialContact, setShowCommercialContact] = useState(false);
    
    function showSettings(event) 
    {
        event.preventDefault();
//TODO        
    }

    function showContact(event)
    {
        event.preventDefault();
        setShowCommercialContact(true);
    }

    // NOTE: You also need to provide styles, see https://github.com/negomi/react-burger-menu#styling
    return (
        <>
            <Menu isOpen noOverlay noTransition width={ 240 } itemListElement="div">
                <a onClick={props.themeSetter}>Theme</a>
                <a id="home" className="menu-item" href="/">Home</a>
                <a id="about" className="menu-item" href="/about">About</a>
                <a id="contact" className="menu-item" href="" onClick={showContact}>Contact</a>
                <a onClick={showSettings} className="menu-item--small" href="">Settings</a>
            </Menu>

            <CommercialContactModal
                open={showCommercialContact}
                interest="ThreatLab commercial services"
                onClose={() => setShowCommercialContact(false)}
            />
        </>
    );
}
export default BurgerMenu;
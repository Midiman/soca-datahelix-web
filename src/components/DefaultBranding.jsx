

const DefaultBranding = (props) => (
    <div className='logo' style={{ display: 'flex', flexDirection:'column', alignItems: 'center', gap: '0px' }}>
        {
            props.orientation === 'horizontal'
            ?
                <div className={`default-branding horizontal ${props.className}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox={props?.viewBox ? props?.viewBox : "0 0 100 100"}>
                        <circle cx="50" cy="50" r="8" fill="#88b8b8"></circle>
                        
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#88b8b8" stroke-width="4"></circle>
                        
                        <line x1="50" y1="20" x2="50" y2="6" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                        <line x1="50" y1="80" x2="50" y2="94" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                        <line x1="20" y1="50" x2="6" y2="50" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                        <line x1="80" y1="50" x2="94" y2="50" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                    </svg>
                    <span>SOC</span>Automation
                </div>
            :
                <>
                    <div className='default-branding svg vertical'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="8" fill="#88b8b8"></circle>
                            
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#88b8b8" stroke-width="4"></circle>
                            
                            <line x1="50" y1="20" x2="50" y2="6" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                            <line x1="50" y1="80" x2="50" y2="94" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                            <line x1="20" y1="50" x2="6" y2="50" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                            <line x1="80" y1="50" x2="94" y2="50" stroke="#88b8b8" stroke-width="4" stroke-linecap="square"></line>
                        </svg>
                    </div>
                    <div className='default-branding text vertical'>
                        <span>SOC</span>Automation
                    </div>
                </>
        }
    </div>
);
export { DefaultBranding };
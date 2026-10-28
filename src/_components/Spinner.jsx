import React from 'react';
import Spinny from "react-spinkit";

/**
  Global Spinner
*/
export default function Spinner()
{
  return (
    <div className='spinner'>
      <Spinny name='three-bounce' color="#9EAFAC" fadeIn="none"/>
      </div>
  )
};

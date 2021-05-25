import React from 'react';


const KnownAddress = ({knownAddress})=>{
    return(
        knownAddress.map(address=>{
            return(
                <div key={address} className='address'>
                    -{address}</div>
            )
        })
    )
}

export default KnownAddress;
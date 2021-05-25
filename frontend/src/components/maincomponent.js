import React, {Component} from 'react';
import ConductTransaction from './conductTransaction';


class Maincomponent extends Component {
    constructor(props){
        super(props)
        this.state={walletinfo: {}
        }
    }

    componentDidMount(){
        fetch('http://localhost:3001/api/walletinfo')
        .then(res=>res.json())
        .then(data=>this.setState({walletinfo:data}))
    }



    render(){
        const {address,balance} = this.state.walletinfo;
        return (
        <div>
            <h3 >Welcome To Crypto-grey</h3>
            <div className='CryptoInfo'>
                Crypto-grey is a type of cryptocurrency which is build on top of the blockchain technology and is created using node js.
            </div>
            <hr />
            <div className='WalletInfo' >
                <h5><span className='walcol'>Wallet Address : </span>{address}</h5>
                <h5><span className='walcol'>Wallet Balance : </span>{balance}</h5>
            </div>
            <div> 
             <a href='/blocks'>BLOCKS CHAIN</a>
            </div>
            <div>      
             <ConductTransaction address={address} />
             <hr />
            </div>
            <div>
             <a href='/transactionpool'>Transaction Pool</a>
            </div>
        </div>
        );
  }
}

export default Maincomponent;
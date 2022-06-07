const BigNumber = require("bignumber.js");
const Web3 = require("Web3");
const rpc = "https://polygon-rpc.com/";
const web3 = new Web3(rpc);
const ABI_setToken = require("./abi/setToken.json");
const ABI_trade = require("./abi/trade.json");

// Config
const TradeModule = "0xd04AabadEd11e92Fefcd92eEdbBC81b184CdAc82";
const _setToken = "0x1f073E96fB0887FdE9282B89B4d5aC69e9D088DE";
const _exchangeName = "ZeroExApiAdapterV4";

const fromToken = {
  address: "0x5c2ed810328349100A66B82b78a1791B101C9D61",
  decimals: 8,
  symbol: "wBTC",
};
const fromValue = 0.0000002;
const toToken = {
  address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  decimals: 6,
  symbol: "USDT",
};

(async () => {
  const setContract = new web3.eth.Contract(ABI_setToken, _setToken);
  const tradeModule = new web3.eth.Contract(ABI_trade, TradeModule);

  const fromSourceValue = BigNumber(fromValue)
    .times(Math.pow(10, fromToken.decimals))
    .toFixed(0);

  const totalSupply = await setContract.methods.totalSupply().call();
  const positions = await setContract.methods.getPositions().call();
  const tokenItem = positions.find(
    (item) => item.component.toLowerCase() === fromToken.address.toLowerCase()
  );
  const fromTokenUnit = tokenItem.unit;
  const _sendToken = fromToken.address;

  // const _sendQuantity = BigNumber(fromSourceValue)
  //   .times(fromTokenUnit)
  //   .div(BigNumber(fromTokenUnit).times(totalSupply).div(Math.pow(10, 18)))
  //   .toFixed(0);

  const _sendQuantity = BigNumber(fromSourceValue)
    .times(1e18)
    .div(totalSupply)
    .toFixed(0);

  const _receiveToken = toToken.address;
  const _minReceiveQuantity = "1";
  const _data = "0x";

  console.log(`> trade ${fromValue} ${fromToken.symbol} (${fromSourceValue})

    _setToken     : ${_setToken}
    _exchangeName : ${_exchangeName}
    _sendToken    : ${_sendToken} (${fromToken.symbol})
    _sendQuantity : ${_sendQuantity} 🆘
        -  fromSourceValue    : ${fromSourceValue}
        -  totalSupply        : ${totalSupply}
        -  fromTokenUnit      : ${fromTokenUnit}

        -  fromTokenUnit * totalSupply/10**18 = ${BigNumber(fromTokenUnit)
          .times(totalSupply)
          .div(Math.pow(10, 18))
          .toFixed(4)}
        -  fromSourceValue * fromTokenUnit / (fromTokenUnit * totalSupply/10**18) => ${_sendQuantity}
    `);
  const target = await tradeModule.methods
    .trade(
      _setToken,
      _exchangeName,
      _sendToken,
      _sendQuantity,
      _receiveToken,
      _minReceiveQuantity,
      _data
    )
    .encodeABI();
  console.log("Input Data:", target);
})();

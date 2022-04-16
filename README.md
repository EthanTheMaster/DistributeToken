# What is this?
I wanted to play with making a smart contract and creating a web interface to interact with that smart contract. The smart contract accepts payment in the network's native currency (e.g Ethereum) and distributes that payment to a set of recipients. Each recipient is associated with a number of "shares." The amount each recipient receives is proportional to the number of shares assigned to them. 

For example suppose you are distributing `1 ETH` according to the following distribution
| Name | Shares | Amount Received
| ---- | ------ | -------- |
| Alice | 1 | 0.166666666666666666 |
| Bob | 2 | 0.333333333333333333 |
| Charlie | 3 | 0.5 |
| Total | 6 | 0.999999999999999999 |

Then Alice would receive roughly `1/6` of the payment. Bob would roughly receive `2/6 = 1/3` of the payment, and Charlie would receive `3/6 = 1/2` of the payment. Because only an integer amount of tokens can be sent, it would be impossible to perfectly distribute the payment in some scenarios as the above example shows. _Thus all fractional amounts will be rounded down._

For example, suppose we are distributing cash with dollar bills and coins to keep this example simple. If Alice deserves `$33.3333...`, Alice would receive `$33.33` because we cannot give Alice a fraction of a penny. The same mechanism applies when distributing tokens. Because the smallest unit of currency is so small on Ethereum, the "loss" is extremely negligible but is nevertheless present. Please be aware of this rounding mechanism. It is not a good idea to apply the distribution process multiple times. You run the risk of the error compounding leading to users being short-changed. This application was designed for one-time use as an ad-hoc method to distribute money.

The web interface was built using `Vue` as an exercise for me. I made an effort to make the distribution transparent. In fact, the confirmation screen uses the smart contract to simulate the distribution. The impact of the rounding mechanism will be presented so the user is aware of what the final result will be. For convenience, the web interface also gives a method to deploy a fresh contract, but doing this repeatedly is wasteful (wasting network storage and gas) and using a previous deployment is recommended. 

**Disclaimer:** While I tried my best to program this smart contract correctly, use this contract at your own risk. I will not be responsible for any loss that occurs due to incorrect usage or incorrect implementation. 

# Why I made this
In Ethereum, a 256-bit number is used to represent amounts with 18 decimals places of granularity displayed to users. It is generally not a good idea to attempt to do this distribution by hand with a standard calculator which likely uses floating point numbers and truncates results. Floating point numbers suffer from round-off issues and potentially may not have enough precision to faithfully represent amounts being distributed. I made this smart contract as a possible solution.

# Build
To build the project, run a local testnet with Ganache (on `127.0.0.1:7545`) and execute
```
npx truffle migrate --network development
```
This will build `contracts/Distribute.sol` and generate the ABI for the contract in `web/`.

To interact with the application, launch a web server that exposes the `web/` directory.

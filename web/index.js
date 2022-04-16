const ethEnabled = async() => {
    if (window.ethereum) {
        console.log("Detected wallet...")
        await window.ethereum.request({method: "eth_requestAccounts"});
        window.web3 = new Web3(window.ethereum);
    }
}

Vue.createApp({
    data() {
        return {
            contract: document.cookie,
            distributeContractData: {},
            addresses: ["", ""],
            // Amount to send as specified by the user ... must be converted to lowest unit
            amountToSend: "0",
            tokenSymbol: "ETH",
            // Treat shares as raw string representing number
            shares: ["0", "0"],
            previewStats: {
                distributionStats: [],
                leftover: ""
            },
            previewReady: false
        }
    },
    mounted() {
        fetch('./DistributeContract.json')
            .then(response => response.json())
            .then(data => {
                this.distributeContractData = data;
            });

        if (window.ethereum) {
            console.log("Detected wallet...")
            window.ethereum.request({method: "eth_requestAccounts"}).then(() => {
                window.web3 = new Web3(window.ethereum);
            })
            .catch(() =>{
                alert("Please refresh and connect your wallet.")
            });
        }
    },
    methods: {
        addNewEntry() {
            this.addresses.push("");
            this.shares.push("0");
        },
        deleteEntry(idx) {
            this.shares.splice(idx, 1);
            this.addresses.splice(idx, 1);
        },
        isShareInvalid(idx) {
            let numInterpretation = Number(this.shares[idx]);
            return isNaN(numInterpretation) || numInterpretation < 0 || this.shares[idx].trim() == "";
        },
        isAddressInvalid(idx) {
            return !Web3.utils.isAddress(this.addresses[idx]);
        },
        submitTransaction() {
            let contract = new web3.eth.Contract(this.distributeContractData.abi, this.contract);
            let amount = web3.utils.toWei(this.amountToSend, "ether");

            web3.eth.getAccounts().then(accounts => {
                contract.methods.redistribute(this.addresses, this.normalizeShares)
                    .send({from: accounts[0], value: amount})
                    .then(res => {
                        document.cookie = this.contract;
                        console.log(res);
                    });
                // TODO: Add error handling for failed transactions and add logic for success
            });
        },
        generatePreview() {
            let contract = new web3.eth.Contract(this.distributeContractData.abi, this.contract);
            let amount = web3.utils.toWei(this.amountToSend, "ether");
            contract.methods.simulateRedistribute(this.normalizeShares, amount).call()
                .then(res => {
                    let distribution = res[0];
                    let leftover = web3.utils.fromWei(res[1]);
                    
                    let decimals = 4;
                    let distributionStats = [];

                    let BN = web3.utils.BN;
                    distribution.forEach(share => {
                        let rawPercentage = new BN(share)
                            // Add 2 to get percentage and 
                            // add 1 to get an extra digit for rounding otherwise division will round down
                            .mul(new BN(10).pow(new BN(2 + decimals + 1))) 
                            .div(new BN(amount));

                        let percentage = Number(rawPercentage.toString()) / (Math.pow(10, decimals + 1));
                        percentage = percentage.toFixed(decimals);
                        distributionStats.push([web3.utils.fromWei(share), percentage])
                    });

                    this.previewStats = {
                        distributionStats: distributionStats,
                        leftover: leftover
                    };
                    this.previewReady = true;
                })
                .catch(e => {
                    alert("An error occurred. Check the console.")
                    console.log(e);
                })
        },
        generateNewContractInstance() {
            let contract = new web3.eth.Contract(this.distributeContractData.abi);
            web3.eth.getAccounts().then(accounts => {
                contract
                    .deploy({data: this.distributeContractData.bytecode})
                    .send({
                        from: accounts[0]
                    })
                    .on("receipt", receipt => {
                        console.log(receipt);
                        this.contract = receipt.contractAddress;
                        document.cookie = receipt.contractAddress;
                    });
            });
        }  
    },
    computed: {
        canSubmit() {
            let totalShares = this.shares.reduce((acc, share) => acc + Number(share), 0);
            let allSharesValid = this.shares.reduce((acc, _, i) => acc && !this.isShareInvalid(i), true);
            let allAddressesValid = this.addresses.reduce((acc, _, i) => acc && !this.isAddressInvalid(i), true);
            // The moment when the client is asking if the form is ready for submission occurs when the form is being
            // updated. There is no preview ready. This prevents the UI from attempting to generate a preview.
            this.previewReady = false;

            return totalShares > 0 && allSharesValid && allAddressesValid && !this.isAmountInvalid && !this.isContractInvalid;
        },
        isContractInvalid() {
            return !Web3.utils.isAddress(this.contract);
        },
        isAmountInvalid() {
            let numInterpretation = Number(this.amountToSend);
            return isNaN(numInterpretation) || numInterpretation <= 0
        },
        normalizeShares() {
            if (this.canSubmit) {
                // Shares are not malformed

                // Users can specify create arbitrarily precise share value. Keep track
                // of the resolution needed to faithfully represent share value.
                let maxFractionalResolution = 0;
                let splitShares = []

                // Convert each shares value into a integer and fraction part
                // as big nums
                let BN = web3.utils.BN;
                this.shares.forEach(x => {
                    let split = x.split(".");
                    let integral = new BN(split[0]);
                    let fractional = new BN(0);

                    if (split.length > 1) {
                        fractional = new BN(split[1]);
                        maxFractionalResolution = Math.max(maxFractionalResolution, split[1].length);
                    }
                    splitShares.push([integral, fractional]);
                });

                // Each number is represented as: integral + fraction * 10^(-fractionalLength)
                // We can turn all shares into an integral value by multiplying through by
                // 10^maxFractionalResolution.
                return splitShares.map(split => {
                    let integral = split[0];
                    let fractional = split[1];
                    let fractionalLength = fractional.toString().length;
                    return integral
                            .mul(new BN(10).pow(new BN(maxFractionalResolution)))
                            .add(fractional.mul(new BN(10).pow(new BN(maxFractionalResolution - fractionalLength))));
                })

            } else {
                return null;
            }
        },
    }
}).mount('#app')
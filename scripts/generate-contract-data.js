var fs = require("fs");
let distributeContractData = JSON.parse(fs.readFileSync("./build/contracts/Distribute.json"));
fs.writeFileSync("./web/DistributeContract.json", JSON.stringify({
    abi: distributeContractData.abi,
    bytecode: distributeContractData.deployedBytecode
}));

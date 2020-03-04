$(document).ready(function () {
    const derivationPath = "m/44'/60'/0'/0/";
    const provider = new ethers.providers.EtherscanProvider('ropsten');

    const contractAddress = "0x0f2383FeCeCf7304Da193b7c47E29f22c4eB292C";
    const contractAbi = [
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_fact",
                    "type": "string"
                }
            ],
            "name": "add",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "fact",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "nbOfFacts",
                    "type": "uint256"
                }
            ],
            "name": "FactAdded",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "count",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index",
                    "type": "uint256"
                }
            ],
            "name": "getFact",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];

    let contract, availableFunctions, contractWithSigner;

    let wallets = {};

    showView("viewHome");

    $('#linkHome').click(function () {
        showView("viewHome");
    });

    $('#linkCreateNewWallet').click(function () {
        $('#passwordCreateWallet').val('');
        $('#textareaCreateWalletResult').val('');
        showView("viewCreateNewWallet");
    });

    $('#linkImportWalletFromMnemonic').click(function () {
        $('#textareaOpenWallet').val('');
        $('#passwordOpenWallet').val('');
        $('#textareaOpenWalletResult').val('');
        $('#textareaOpenWallet').val('toddler online monitor oblige solid enrich cycle animal mad prevent hockey motor');
        showView("viewOpenWalletFromMnemonic");
    });

    $('#linkImportWalletFromFile').click(function () {
        $('#walletForUpload').val('');
        $('#passwordUploadWallet').val('');
        showView("viewOpenWalletFromFile");
    });

    $('#linkShowMnemonic').click(function () {
        $('#passwordShowMnemonic').val('');
        showView("viewShowMnemonic");
    });

    $('#linkShowAddressesAndBalances').click(function () {
        $('#passwordShowAddresses').val('');
        $('#divAddressesAndBalances').empty();
        showView("viewShowAddressesAndBalances");
    });

    $('#linkSendTransaction').click(function () {
        $('#divSignAndSendTransaction').hide();
        $('#passwordSendTransaction').val('');
        $('#transferValue').val('');
        $('#senderAddress').empty();
        $('#textareaSignedTransaction').val('');
        $('#textareaSendTransactionResult').val('');
        showView("viewSendTransaction");
    });

    $('#linkExportJSON').click(function () {
        $('#containerExportJSONPreview').hide();
        showView("viewExportJSON");
    });

    $('#linkContracts').click(function () {
        $('#divConnectContract').hide();
        $('#divConnectDetails').hide();
        showView("viewContracts");
    });

    $('#buttonGenerateNewWallet').click(generateNewWallet);
    $('#buttonOpenExistingWallet').click(openWalletFromMnemonic);
    $('#buttonUploadWallet').click(openWalletFromFile);
    $('#buttonShowMnemonic').click(showMnemonic);
    $('#buttonShowAddresses').click(showAddressesAndBalances);
    $('#buttonSendAddresses').click(() => unlockWalletAndDeriveAddresses('send'));
    $('#buttonSignTransaction').click(signTransaction);
    $('#buttonSendSignedTransaction').click(sendSignedTransaction);
    $('#buttonExportJSONPassword').click(showJSON);
    $('#buttonExportJSON').click(exportJSON);
    $('#buttonConnectContract').click(() => unlockWalletAndDeriveAddresses('connectContract'));

    $('#linkDelete').click(deleteWallet);

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();

        if (localStorage.JSON) {
            $('#linkCreateNewWallet').hide();
            $('#linkImportWalletFromMnemonic').hide();
            $('#linkImportWalletFromFile').hide();

            $('#linkShowMnemonic').show();
            $('#linkShowAddressesAndBalances').show();
            $('#linkSendTransaction').show();
            $('#linkExportJSON').show();
            $('#linkContracts').show();
            $('#linkDelete').show();
        }

        else {
            $('#linkShowMnemonic').hide();
            $('#linkShowAddressesAndBalances').hide();
            $('#linkSendTransaction').hide();
            $('#linkExportJSON').hide();
            $('#linkContracts').hide();
            $('#linkDelete').hide();

            $('#linkCreateNewWallet').show();
            $('#linkImportWalletFromMnemonic').show();
            $('#linkImportWalletFromFile').show();
        }

    }

    function showInfo(message) {
        $('#infoBox>p').html(message);
        $('#infoBox').show();
        $('#infoBox>header').click(function () {
            $('#infoBox').hide();
        })
    }

    function showError(errorMsg) {
        $('#errorBox>p').html('Error: ' + errorMsg);
        $('#errorBox').show();
        $('#errorBox>header').click(function () {
            $('#errorBox').hide();
        })
    }

    function showLoadingProgress(percent) {
        $('#loadingBox').html("Loading... " + parseInt(percent * 100) + "% complete");
        $('#loadingBox').show();
        $('#loadingBox>header').click(function () {
            $('#errorBox').hide();
        })
    }

    function hideLoadingBar() {
        $('#loadingBox').hide();
    }

    function showLoggedInButtons() {
        $('#linkCreateNewWallet').hide();
        $('#linkImportWalletFromMnemonic').hide();
        $('#linkImportWalletFromFile').hide();

        $('#linkShowMnemonic').show();
        $('#linkShowAddressesAndBalances').show();
        $('#linkSendTransaction').show();
        $('#linkExportJSON').show();
        $('#linkContracts').show();
        $('#linkDelete').show();
    }

    function encryptAndSaveJSON(wallet, password) {
        return wallet.encrypt(password, {}, showLoadingProgress)
         .then(json => {
            localStorage['JSON'] = json;
            showLoggedInButtons();
         })
         .catch(showError)
         .finally(hideLoadingBar);
    }

    function decryptWallet(json, password) {
        return ethers.Wallet.fromEncryptedWallet(json, password, showLoadingProgress);
    }

    function generateNewWallet() {
        const password = $('#passwordCreateWallet').val();
        const wallet = ethers.Wallet.createRandom();
        
        encryptAndSaveJSON(wallet, password)
            .then(() => {
                showInfo('PLEASE SAVE YOUR MNEMONIC: ' + wallet.mnemonic);
                $('#textareaCreateWalletResult').val(localStorage.JSON);
            });
    }

    function openWalletFromMnemonic() {
        const mnemonic = $('#textareaOpenWallet').val();

        if (!ethers.HDNode.isValidMnemonic(mnemonic)) {
            return showError('Invalid mnemonic!');
        }

        const password = $('#passwordOpenWallet').val();
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        encryptAndSaveJSON(wallet, password)
            .then(() => {
                showInfo('Wallet successfully loaded!');
                $('#textareaOpenWalletResult').val(localStorage.JSON);
            });
    }

    function openWalletFromFile() {
        if ($('#walletForUpload')[0].files.length === 0) {
            return showError('Please select a file to upload.');
        }

        const password = $('#passwordUploadWallet').val();
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const json = fileReader.result;
            
            decryptWallet(json, password)
                .then(wallet => {
                    if (!wallet.mnemonic) {
                        return showError('Invalid JSON file!');
                    }

                    localStorage['JSON'] = json;
                    showInfo('Wallet successfully loaded!');
                    showLoggedInButtons();
                })
                .catch(showError)
                .finally(hideLoadingBar);
        };

        fileReader.readAsText($('#walletForUpload')[0].files[0]);
    }

    function showMnemonic() {
        const password = $('#passwordShowMnemonic').val();
        const json = localStorage.JSON;

        decryptWallet(json, password)
            .then(wallet => {
                showInfo('Your mnemonic is: ' + wallet.mnemonic);
            })
            .catch(showError)
            .finally(hideLoadingBar)
    }

    function showAddressesAndBalances() {
        const password = $('#passwordShowAddresses').val();
        const json = localStorage.JSON;

        decryptWallet(json, password)
            .then(renderAddressesAndBalances)
            .catch(error => {
                $('#divAddressesAndBalances').empty();
                showError(error);
            })
            .finally(hideLoadingBar)

        function renderAddressesAndBalances(wallet) {
            $('#divAddressesAndBalances').empty();

            const masterNode = ethers.HDNode.fromMnemonic(wallet.mnemonic);

            for (let i = 0; i < 5; i++) {
                const div = $('<div id="qrcode"></div>');
                const wallet = new ethers.Wallet(masterNode.derivePath(derivationPath + i).privateKey, provider);
                
                wallet.getBalance()
                    .then(balance => {
                        div.qrcode(wallet.address);
                        div.append($(`<p>${wallet.address}: ${ethers.utils.formatEther(balance)} ETH</p>`));
                        $('#divAddressesAndBalances').append(div);
                    })
                    .catch(showError);
            }
        }
    }

    function unlockWalletAndDeriveAddresses(operation) {
        const passwordEl = operation === 'connectContract' ? $('#passwordConnectContract') : $('#passwordSendTransaction');
        const divEl = operation === 'connectContract' ?  $('#divConnectContract') : $('#divSignAndSendTransaction');
        const addressEl =  operation === 'connectContract' ?  $('#connectedAddress') : $('#senderAddress');
        const password = passwordEl.val();
        const json = localStorage.JSON;

        decryptWallet(json, password)
            .then(wallet => {
                showInfo('Wallet successfully unlocked!');
                renderAddresses(wallet);
                divEl.show();
                if (operation === 'connectContract' && !contract && !availableFunctions) {
                    loadContract();
                }
                // $('#divConnectDetails').show();
            })
            .catch(showError)
            .finally(() => {
                passwordEl.val('');
                hideLoadingBar();
            });

        function renderAddresses(wallet) {
            addressEl.empty();
            const masterNode = ethers.HDNode.fromMnemonic(wallet.mnemonic);

            for (let i = 0; i < 5; i++) {
                const wallet = new ethers.Wallet(masterNode.derivePath(derivationPath + i).privateKey, provider);
                const address = wallet.address;
                wallets[address] = wallet;
                const option = $(`<option id=${wallet.address}>`).text(address);
                addressEl.append(option);
            }
        }
    }

    function signTransaction() {
        const senderAddress = $('#senderAddress option:selected').attr('id');
        const wallet = wallets[senderAddress];

        if (!wallet) {
            return showError('Invalid address!');
        }
        
        const recipient = $('#recipientAddress').val();
        if (!recipient) {
            return showError('Invalid recipient!');
        }

        const value = $('#transferValue').val();
        if (!value) {
            return showError('Invalid transfer value!');
        }

        wallet.getTransactionCount()
            .then(signTransaction)
            .catch(showError)

        function signTransaction(nonce) {
            const transaction = {
                nonce,
                gasLimit: 21000,
                gasPrice: ethers.utils.bigNumberify('20000000000'),
                to: recipient,
                value: ethers.utils.parseEther(value.toString()),
                data: '0x',
                chainId: provider.chainId
            };

            const signedTransaction = wallet.sign(transaction);
            $('#textareaSignedTransaction').val(signedTransaction);
        }
    }

    function sendSignedTransaction() {
        const signedTransaction = $('#textareaSignedTransaction').val();
        
        provider.sendTransaction(signedTransaction)
            .then(hash => {
                showInfo('Transaction hash: ' + hash);
                const etherscanUrl = 'https://ropsten.etherscan.io/tx/' + hash;
                $('#textareaSendTransactionResult').val(etherscanUrl);
            })  
            .catch(error => {
                showError(error);
            });
    }

    function showJSON() {
        const password = $('#passwordExportJSON').val();
        const json = localStorage.JSON;

        decryptWallet(json, password)
            .then(() => {
                $('#textareaExportJSONPreview').val(localStorage.JSON);
                $('#containerExportJSONPreview').show();
            })
            .catch(showError)
            .finally(() => {
                $('#passwordExportJSON').val('');
                hideLoadingBar();
            });
    }

    function exportJSON() {
        const contentJSON = localStorage.JSON;
        const fileName = JSON.parse(contentJSON)['x-ethers'].gethFilename + '.json';
        downloadJSON(contentJSON, fileName, 'application/json');
    }

    function downloadJSON(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    function deleteWallet() {
        localStorage.clear();
        showView('viewHome');
    }
    
    async function loadContract() {
        // define contract as singleton
        contract = new ethers.Contract(contractAddress, contractAbi, provider);
    
        // define contract's functions
        availableFunctions = contract.interface.abi.filter(item => item.type === 'function');
        // const events = contract.interface.abi.filter(item => item.type === 'event');
        // console.log(console.log(ethers.version));
        contract.events['FactAdded'] = (fact, nbOfFacts) => console.log(fact, nbOfFacts);
        // events.forEach(e => contract.on(e.name, (fact, nbOfFacts) => console.log(fact, nbOfFacts)));

        // load views
        addContractView();
    }

    function addContractView() {
        $('#contractAddress').text('Address: ' + contractAddress);
        availableFunctions.forEach(fn => {
            addContractFunctionView(fn);
            // add click listenner to contract' sfunctions functions
            $(`#${fn.name} button`).click(callFunction);
        });
    }
    
    function addContractFunctionView(fn) {
        $('#contractFunctionsList').append(`<li id="${fn.name}"><button functionName="${fn.name}">${fn.name}</button></li>`);
        if (fn.inputs && fn.inputs.length > 0) {
            fn.inputs.forEach(input => {
                const inputType = defineFunctionInputType(input);
                $(`#${fn.name}`).append(`<input type="${inputType}"/>`);
            });
        }
        $(`#${fn.name}`).append(`<span></span>`);
    }
    
    function defineFunctionInputType(input) {
        switch(input.type) {
            case 'string':
                return 'text'
            case 'uint256':
            case 'uint':
                return 'number'
            default:
                throw new Error(`Function ${fn.name} has an unspecified type`);
        }
    }

    async function callFunction() {
        try {
            const functionName = $(this).attr('functionName');

            const functionInfo = availableFunctions.find(f => f.name === functionName);
            const isConstant = functionInfo && functionInfo.constant;
            
            if (isConstant) {
                const result = await contract[functionName]();
                $(`#${functionName} span`).text(`${result}`);
            } else {
                const senderAddress = $('#connectedAddress option:selected').attr('id');
                const wallet = wallets[senderAddress];
                const contractWithSigner = contract.connect(wallet);
                
                let tx = await contractWithSigner[functionName]('inputValue');
                const ropstenLink = 'https://ropsten.etherscan.io/tx/' + tx.hash;
                $('#divConnectContract').append(`<a href="${ropstenLink}" target="_blank">${ropstenLink}<a/>`);
                await tx.wait();
            }
    
        } catch(err) {
            showError(err);
        }
    }
});

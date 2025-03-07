// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract TaxDB {
    struct TaxDetail {
        bytes32 ID;
        bytes32 taxNumber;
        bytes32 transactionNumber;
        uint amountPayed;
        uint yearlyIncome;
    }

    mapping(bytes32 => TaxDetail) public taxDetails;

    function addTaxDetails(string calldata _ID, string calldata _taxNumber, string calldata _transactionNumber, uint _amountPayed, uint _yearlyIncome) public payable{
        TaxDetail memory entity = taxDetails[bytes32(bytes(_ID))];

        entity.ID = bytes32(bytes(_ID));
        entity.taxNumber = bytes32(bytes(_taxNumber));
        entity.transactionNumber = bytes32(bytes(_transactionNumber));
        entity.amountPayed = _amountPayed;
        entity.yearlyIncome = _yearlyIncome;

        taxDetails[bytes32(bytes(_ID))] = entity;
    }

}
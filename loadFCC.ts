import * as fs from 'fs';
import * as path from 'path';

interface ULSDataRecord {
    recordType: string; // char(2)
    uniqueSystemIdentifier: number; // numeric(9,0)
    ulsFileNumber: string; // char(14)
    ebfNumber: string; // varchar(30)
    callSign: string; // char(10)
    licenseStatus: string; // char(1)
    radioServiceCode: string; // char(2)
    grantDate: string; // mm/dd/yyyy
    expiredDate: string; // mm/dd/yyyy
    cancellationDate: string; // mm/dd/yyyy
    eligibilityRuleNum: string; // char(10)
    reserved1: string; // char(1)
    alien: string; // char(1)
    alienGovernment: string; // char(1)
    alienCorporation: string; // char(1)
    alienOfficer: string; // char(1)
    alienControl: string; // char(1)
    revoked: string; // char(1)
    convicted: string; // char(1)
    adjudged: string; // char(1)
    reserved2: string; // char(1)
    commonCarrier: string; // char(1)
    nonCommonCarrier: string; // char(1)
    privateComm: string; // char(1)
    fixed: string; // char(1)
    mobile: string; // char(1)
    radiolocation: string; // char(1)
    satellite: string; // char(1)
    developmentalOrSTAOrDemo: string; // char(1)
    interconnectedService: string; // char(1)
    certifierFirstName: string; // varchar(20)
    certifierMI: string; // char(1)
    certifierLastName: string; // varchar(20)
    certifierSuffix: string; // char(3)
    certifierTitle: string; // char(40)
    female: string; // char(1)
    blackOrAfricanAmerican: string; // char(1)
    nativeAmerican: string; // char(1)
    hawaiian: string; // char(1)
    asian: string; // char(1)
    white: string; // char(1)
    hispanic: string; // char(1)
    effectiveDate: string; // mm/dd/yyyy
    lastActionDate: string; // mm/dd/yyyy
    auctionID: number; // integer
    broadcastServicesRegulatoryStatus: string; // char(1)
    bandManagerRegulatoryStatus: string; // char(1)
    broadcastServicesTypeOfRadioService: string; // char(1)
    alienRuling: string; // char(1)
    licenseeNameChange: string; // char(1)
    whitespaceIndicator: string; // char(1)
    operationPerformanceRequirementChoice: string; // char(1)
    operationPerformanceRequirementAnswer: string; // char(1)
    discontinuationOfService: string; // char(1)
    regulatoryCompliance: string; // char(1)
    eligibility900MHzCertification: string; // char(1)
    transition900MHzPlanCertification: string; // char(1)
    return900MHzSpectrumCertification: string; // char(1)
    payment900MHzCertification: string; // char(1)
}

export function loadULSData(ulsFilePath: string): ULSDataRecord[] {
    const records: ULSDataRecord[] = [];
    const fileContent = fs.readFileSync(path.resolve(ulsFilePath), 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    for (const line of lines) {
        if (line.trim() === '') continue;
        const fields = line.split('|');

        const record: ULSDataRecord = {
            recordType: fields[0],
            uniqueSystemIdentifier: Number(fields[1]),
            ulsFileNumber: fields[2],
            ebfNumber: fields[3],
            callSign: fields[4],
            licenseStatus: fields[5],
            radioServiceCode: fields[6],
            grantDate: fields[7],
            expiredDate: fields[8],
            cancellationDate: fields[9],
            eligibilityRuleNum: fields[10],
            reserved1: fields[11],
            alien: fields[12],
            alienGovernment: fields[13],
            alienCorporation: fields[14],
            alienOfficer: fields[15],
            alienControl: fields[16],
            revoked: fields[17],
            convicted: fields[18],
            adjudged: fields[19],
            reserved2: fields[20],
            commonCarrier: fields[21],
            nonCommonCarrier: fields[22],
            privateComm: fields[23],
            fixed: fields[24],
            mobile: fields[25],
            radiolocation: fields[26],
            satellite: fields[27],
            developmentalOrSTAOrDemo: fields[28],
            interconnectedService: fields[29],
            certifierFirstName: fields[30],
            certifierMI: fields[31],
            certifierLastName: fields[32],
            certifierSuffix: fields[33],
            certifierTitle: fields[34],
            female: fields[35],
            blackOrAfricanAmerican: fields[36],
            nativeAmerican: fields[37],
            hawaiian: fields[38],
            asian: fields[39],
            white: fields[40],
            hispanic: fields[41],
            effectiveDate: fields[42],
            lastActionDate: fields[43],
            auctionID: Number(fields[44]),
            broadcastServicesRegulatoryStatus: fields[45],
            bandManagerRegulatoryStatus: fields[46],
            broadcastServicesTypeOfRadioService: fields[47],
            alienRuling: fields[48],
            licenseeNameChange: fields[49],
            whitespaceIndicator: fields[50],
            operationPerformanceRequirementChoice: fields[51],
            operationPerformanceRequirementAnswer: fields[52],
            discontinuationOfService: fields[53],
            regulatoryCompliance: fields[54],
            eligibility900MHzCertification: fields[55],
            transition900MHzPlanCertification: fields[56],
            return900MHzSpectrumCertification: fields[57],
            payment900MHzCertification: fields[58]
        };

        records.push(record);

        console.log(record);
    }

    return records;
}

loadULSData('AM.dat');

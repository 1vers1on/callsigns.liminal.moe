import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { prisma } from './prisma';
import * as cliProgress from 'cli-progress';

const FCC_URL = 'https://data.fcc.gov/download/pub/uls/complete/l_amat.zip';
const TEMP_DIR = path.join(os.tmpdir(), 'fcc-import');

interface AMDataRecord {
    recordType: string; // char(2)
    uniqueSystemIdentifier: number; // numeric(9,0)
    ulsFileNum: string; // char(14)
    ebfNumber: string; // varchar(30)
    callSign: string; // char(10)
    operatorClass: string; // char(1)
    groupCode: string; // char(1)
    regionCode: number; // tinyint
    trusteeCallSign: string; // char(10)
    trusteeIndicator: string; // char(1)
    physicianCertification: string; // char(1)
    veSignature: string; // char(1)
    systematicCallSignChange: string; // char(1)
    vanityCallSignChange: string; // char(1)
    vanityRelationship: string; // char(12)
    previousCallSign: string; // char(10)
    previousOperatorClass: string; // char(1)
    trusteeName: string; // varchar(50)
}

interface ENDataRecord {
    recordType: string; // char(2)
    uniqueSystemIdentifier: number; // numeric(9,0)
    ulsFileNumber: string; // char(14)
    ebfNumber: string; // varchar(30)
    callSign: string; // char(10)
    entityType: string; // char(2)
    licenseeId: string; // char(9)
    entityName: string; // varchar(200)
    firstName: string; // varchar(20)
    mi: string; // char(1)
    lastName: string; // varchar(20)
    suffix: string; // char(3)
    phone: string; // char(10)
    fax: string; // char(10)
    email: string; // varchar(50)
    streetAddress: string; // varchar(60)
    city: string; // varchar(20)
    state: string; // char(2)
    zipCode: string; // char(9)
    poBox: string; // varchar(20)
    attentionLine: string; // varchar(35)
    sgin: string; // char(3)
    frn: string; // char(10)
    applicantTypeCode: string; // char(1)
    applicantTypeOther: string; // char(40)
    statusCode: string; // char(1)
    statusDate: string; // datetime
    licCategoryCode: string; // char(1)
    linkedLicenseId: number; // numeric(9,0)
    linkedCallsign: string; // char(10)
}

interface HDDataRecord {
    recordType: string; // char(2)
    uniqueSystemIdentifier: number; // numeric(9,0)
    ulsFileNumber: string; // char(14)
    ebfNumber: string; // varchar(30)
    callSign: string; // char(10)
    licenseStatus: string; // char(1)
    radioServiceCode: string; // char(2)
    grantDate: string; // char(10)
    expiredDate: string; // char(10)
    cancellationDate: string; // char(10)
    eligibilityRuleNum: string; // char(10)
    applicantTypeCodeReserved: string; // char(1)
    alien: string; // char(1)
    alienGovernment: string; // char(1)
    alienCorporation: string; // char(1)
    alienOfficer: string; // char(1)
    alienControl: string; // char(1)
    revoked: string; // char(1)
    convicted: string; // char(1)
    adjudged: string; // char(1)
    involvedReserved: string; // char(1)
    commonCarrier: string; // char(1)
    nonCommonCarrier: string; // char(1)
    privateComm: string; // char(1)
    fixed: string; // char(1)
    mobile: string; // char(1)
    radiolocation: string; // char(1)
    satellite: string; // char(1)
    developmentalOrSta: string; // char(1)
    interconnectedService: string; // char(1)
    certifierFirstName: string; // varchar(20)
    certifierMI: string; // char(1)
    certifierLastName: string; // varchar(20)
    certifierSuffix: string; // char(3)
    certifierTitle: string; // char(40)
    sex: string; // char(1)
    africanAmerican: string; // char(1)
    nativeAmerican: string; // char(1)
    hawaiian: string; // char(1)
    asian: string; // char(1)
    white: string; // char(1)
    ethnicity: string; // char(1)
    effectiveDate: string; // char(10)
    lastActionDate: string; // char(10)
    auctionID: number; // int
    regStatBroadServ: string; // char(1)
    bandManager: string; // char(1)
    typeServBroadServ: string; // char(1)
    alienRuling: string; // char(1)
    licenseeNameChange: string; // char(1)
    whitespaceInd: string; // char(1)
    additionalCertChoice: string; // char(1)
    additionalCertAnswer: string; // char(1)
    discontinuationInd: string; // char(1)
    regulatoryComplianceInd: string; // char(1)
    eligibilityCert900: string; // char(1)
    transitionPlanCert900: string; // char(1)
    returnSpectrumCert900: string; // char(1)
    paymentCert900: string; // char(1)
}

interface CombinedCallsignData {
    callsign: string;
    operatorName?: string;
    licenseClass?: string;
    licenseType?: string;
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'REVOKED';
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country: string;
    ituZone?: number;
    regulatoryBody?: string;
    gridSquare?: string;
    userId?: number;
    views?: number;
}

function loadAMData(amFilePath: string): AMDataRecord[] {
    const records: AMDataRecord[] = [];
    const fileContent = fs.readFileSync(path.resolve(amFilePath), 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    for (const line of lines) {
        if (line.trim() === '') continue;
        const fields = line.split('|');
        const record: AMDataRecord = {
            recordType: fields[0],
            uniqueSystemIdentifier: Number(fields[1]),
            ulsFileNum: fields[2],
            ebfNumber: fields[3],
            callSign: fields[4],
            operatorClass: fields[5],
            groupCode: fields[6],
            regionCode: Number(fields[7]),
            trusteeCallSign: fields[8],
            trusteeIndicator: fields[9],
            physicianCertification: fields[10],
            veSignature: fields[11],
            systematicCallSignChange: fields[12],
            vanityCallSignChange: fields[13],
            vanityRelationship: fields[14],
            previousCallSign: fields[15],
            previousOperatorClass: fields[16],
            trusteeName: fields[17]
        };
        records.push(record);
    }
    return records;
}

function loadENData(enFilePath: string): ENDataRecord[] {
    const records: ENDataRecord[] = [];
    const fileContent = fs.readFileSync(path.resolve(enFilePath), 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    for (const line of lines) {
        if (line.trim() === '') continue;
        const fields = line.split('|');
        const record: ENDataRecord = {
            recordType: fields[0],
            uniqueSystemIdentifier: Number(fields[1]),
            ulsFileNumber: fields[2],
            ebfNumber: fields[3],
            callSign: fields[4],
            entityType: fields[5],
            licenseeId: fields[6],
            entityName: fields[7],
            firstName: fields[8],
            mi: fields[9],
            lastName: fields[10],
            suffix: fields[11],
            phone: fields[12],
            fax: fields[13],
            email: fields[14],
            streetAddress: fields[15],
            city: fields[16],
            state: fields[17],
            zipCode: fields[18],
            poBox: fields[19],
            attentionLine: fields[20],
            sgin: fields[21],
            frn: fields[22],
            applicantTypeCode: fields[23],
            applicantTypeOther: fields[24],
            statusCode: fields[25],
            statusDate: fields[26],
            licCategoryCode: fields[27],
            linkedLicenseId: Number(fields[28]),
            linkedCallsign: fields[29]
        };
        records.push(record);
    }
    return records;
}

function loadHDData(hdFilePath: string): HDDataRecord[] {
    const records: HDDataRecord[] = [];
    const fileContent = fs.readFileSync(path.resolve(hdFilePath), 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    for (const line of lines) {
        if (line.trim() === '') continue;
        const fields = line.split('|');
        const record: HDDataRecord = {
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
            applicantTypeCodeReserved: fields[11],
            alien: fields[12],
            alienGovernment: fields[13],
            alienCorporation: fields[14],
            alienOfficer: fields[15],
            alienControl: fields[16],
            revoked: fields[17],
            convicted: fields[18],
            adjudged: fields[19],
            involvedReserved: fields[20],
            commonCarrier: fields[21],
            nonCommonCarrier: fields[22],
            privateComm: fields[23],
            fixed: fields[24],
            mobile: fields[25],
            radiolocation: fields[26],
            satellite: fields[27],
            developmentalOrSta: fields[28],
            interconnectedService: fields[29],
            certifierFirstName: fields[30],
            certifierMI: fields[31],
            certifierLastName: fields[32],
            certifierSuffix: fields[33],
            certifierTitle: fields[34],
            sex: fields[35],
            africanAmerican: fields[36],
            nativeAmerican: fields[37],
            hawaiian: fields[38],
            asian: fields[39],
            white: fields[40],
            ethnicity: fields[41],
            effectiveDate: fields[42],
            lastActionDate: fields[43],
            auctionID: Number(fields[44]),
            regStatBroadServ: fields[45],
            bandManager: fields[46],
            typeServBroadServ: fields[47],
            alienRuling: fields[48],
            licenseeNameChange: fields[49],
            whitespaceInd: fields[50],
            additionalCertChoice: fields[51],
            additionalCertAnswer: fields[52],
            discontinuationInd: fields[53],
            regulatoryComplianceInd: fields[54],
            eligibilityCert900: fields[55],
            transitionPlanCert900: fields[56],
            returnSpectrumCert900: fields[57],
            paymentCert900: fields[58]
        };
        records.push(record);
    }
    return records;
}

function combineFCCData(
    amRecords: AMDataRecord[],
    enRecords: ENDataRecord[],
    hdRecords: HDDataRecord[]
): CombinedCallsignData[] {
    const combinedData: CombinedCallsignData[] = [];
    const enMap = new Map(enRecords.map((record) => [record.callSign, record]));
    const hdMap = new Map(hdRecords.map((record) => [record.callSign, record]));
    const amMap = new Map(amRecords.map((record) => [record.callSign, record]));

    for (const hdRecord of hdRecords) {
        const enRecord = enMap.get(hdRecord.callSign);
        const amRecord = amMap.get(hdRecord.callSign);
        if (!enRecord) continue;

        let status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'REVOKED';
        switch (hdRecord.licenseStatus) {
            case 'A':
                status = 'ACTIVE';
                break;
            case 'E':
                status = 'EXPIRED';
                break;
            case 'C':
                status = 'CANCELLED';
                break;
            case 'S':
                status = 'SUSPENDED';
                break;
            case 'R':
                status = 'REVOKED';
                break;
            default:
                status = 'ACTIVE';
        }

        let operatorName: string | undefined;
        if (enRecord.entityName && enRecord.entityName.trim()) {
            operatorName = enRecord.entityName.trim();
        } else if (enRecord.firstName && enRecord.lastName) {
            operatorName = `${enRecord.firstName.trim()} ${enRecord.lastName.trim()}`.trim();
            if (enRecord.suffix && enRecord.suffix.trim()) {
                operatorName += ` ${enRecord.suffix.trim()}`;
            }
        } else if (amRecord?.trusteeName && amRecord.trusteeName.trim()) {
            operatorName = amRecord.trusteeName.trim();
        }

        let addressLine1: string | undefined;
        let addressLine2: string | undefined;
        if (enRecord.poBox && enRecord.poBox.trim()) {
            addressLine1 = `P.O. Box ${enRecord.poBox.trim()}`;
        } else if (enRecord.streetAddress && enRecord.streetAddress.trim()) {
            addressLine1 = enRecord.streetAddress.trim();
        }
        if (enRecord.attentionLine && enRecord.attentionLine.trim()) {
            addressLine2 = enRecord.attentionLine.trim();
        }

        const postalCode = enRecord.zipCode
            ? enRecord.zipCode.replace(/[^0-9-]/g, '').substring(0, 10)
            : undefined;

        let ituZone: number | undefined;
        if (amRecord?.regionCode) {
            if (amRecord.regionCode <= 3) ituZone = 7;
            else if (amRecord.regionCode <= 6) ituZone = 6;
            else ituZone = 5;
        }

        const combinedRecord: CombinedCallsignData = {
            callsign: hdRecord.callSign.trim(),
            operatorName: operatorName,
            licenseClass: amRecord?.operatorClass || undefined,
            licenseType: hdRecord.radioServiceCode || undefined,
            status: status,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            city: enRecord.city?.trim() || undefined,
            stateProvince: enRecord.state?.trim() || undefined,
            postalCode: postalCode,
            country: 'US',
            ituZone: ituZone,
            regulatoryBody: 'FCC',
            gridSquare: undefined, // Would need additional mapping logic
            userId: undefined, // Set this when associating with users
            views: 0
        };

        // if its not active skip it
        if (combinedRecord.status !== 'ACTIVE') continue;
        combinedData.push(combinedRecord);
    }
    return combinedData;
}

async function loadToDatabase(data: CombinedCallsignData[]) {
    const CHUNK_SIZE = 1000;
    let totalInserted = 0;
    let totalSkipped = 0;

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progress.start(data.length, 0);

    try {
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);

            try {
                const result = await prisma.callsign.createMany({
                    data: chunk,
                    skipDuplicates: true
                });

                totalInserted += result.count;
                totalSkipped += chunk.length - result.count;

                progress.update(i + chunk.length);
            } catch (chunkError) {
                console.error(`Error inserting chunk starting at index ${i}:`, chunkError);
                progress.update(i + chunk.length);
            }
        }

        console.log(`\nDatabase insertion complete!`);
        console.log(`Total records processed: ${data.length}`);
        console.log(`Successfully inserted: ${totalInserted}`);
        console.log(`Skipped (duplicates): ${totalSkipped}`);
    } catch (error) {
        console.error('Error during database insertion:', error);
        throw error;
    } finally {
        progress.stop();
        await prisma.$disconnect();
    }
}

export async function processFCCDataFiles(
    amFilePath: string,
    enFilePath: string,
    hdFilePath: string
): Promise<CombinedCallsignData[]> {
    const amRecords = loadAMData(amFilePath);
    const enRecords = loadENData(enFilePath);
    const hdRecords = loadHDData(hdFilePath);

    const combinedData = combineFCCData(amRecords, enRecords, hdRecords);
    await loadToDatabase(combinedData);

    return combinedData;
}

export async function main() {
    console.log('--- FCC Amateur Radio Data Import ---');

    try {
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        const zipFilePath = path.join(TEMP_DIR, 'l_amat.zip');

        console.log(`Downloading database from FCC...`);
        const response = await axios({
            url: FCC_URL,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(zipFilePath);
        
        const totalLength = response.headers['content-length'];
        const downloadBar = new cliProgress.SingleBar({
            format: 'Download | {bar} | {percentage}% | {value}/{total} Bytes',
        }, cliProgress.Presets.shades_classic);
        
        if (totalLength) downloadBar.start(parseInt(totalLength), 0);

        response.data.on('data', (chunk: Buffer) => {
            downloadBar.increment(chunk.length);
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(undefined));
            writer.on('error', (err) => reject(err));
        });
        downloadBar.stop();

        console.log('Extracting AM.dat, EN.dat, and HD.dat...');
        const zip = new AdmZip(zipFilePath);
        const targetFiles = ['AM.dat', 'EN.dat', 'HD.dat'];
        
        targetFiles.forEach(file => {
            zip.extractEntryTo(file, TEMP_DIR, false, true);
        });

        console.log('Processing data and syncing to database...');
        await processFCCDataFiles(
            path.join(TEMP_DIR, 'AM.dat'),
            path.join(TEMP_DIR, 'EN.dat'),
            path.join(TEMP_DIR, 'HD.dat')
        );

        console.log('Cleaning up temporary files...');
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });

        console.log('Done!');
    } catch (error) {
        console.error('An error occurred during the process:', error);
        process.exit(1);
    }
}

await main();

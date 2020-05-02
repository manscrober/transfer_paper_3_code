import { QueryHandler } from './query-handler';
import { ParamterizedFilterString } from './query-adapter.service';
import { isNull, isNumber } from 'util';
export class MetalDashQueryHandler extends QueryHandler{
    adaptedResult:any;
    constructor(req,res,table:string){
        super(req,res,table);
    }
    public send(){
        this.formatDataForDashboard();
        this.res.send(this.result);
        console.log("result served in "+(Date.now()-this.startdate)+"ms")
    }
    private formatDataForDashboard(){
        this.adaptedResult={}
        this.divideSAPValuesBy1000();//because of SAP number format
        this.setNumberOfFinishedParts();
        this.setNumberCards();
        this.setTimesPerPart();
        this.result=this.adaptedResult;
    }
    private setTimesPerPart(){
        this.adaptedResult['times']={
            max:0,
            series:[]
        }
        let timePerPartSum=0;
        let taktTimeSum=0;
        let n=0;
        for(var partContract in this.result){   
            let contractName=this.contractName(partContract);
            let timePerPart=this.result[partContract]["timeperpart"]
            let taktTime=this.result[partContract]["takttime"];

            this.pushTimes(contractName,timePerPart,taktTime);
            timePerPartSum+=timePerPart??0;
            taktTimeSum+=taktTime??0;
            n++;
        }
        console.log(timePerPartSum+" "+taktTimeSum+" "+n);
        this.pushTimes("Durchschnitt",timePerPartSum/n,taktTimeSum/n);
    }
    private pushTimes(name:string,timePerPart:number=0,takttime:number=0){
        this.adaptedResult.times.series.push({"name":name,"series":[
            {"name":"Zeit pro Teil in Maschine","value":timePerPart},
            {"name":"Taktzeit","value":takttime}
        ]});
    }
    private  divideSAPValuesBy1000(){
        for(var partContract in this.result){
            for (var value in this.result[partContract]){
                if(["IstMenge","SollMenge","OriginalSollMenge"].includes(value)){
                    this.result[partContract][value]=(Number(this.result[partContract][value])/1000).toString();
                }
            }
        }
    }
    private setNumberOfFinishedParts(){
        this.adaptedResult['finishedParts']={
            max:0,
            series:[]
        }
        for(var partContract in this.result){
            let contractName=this.contractName(partContract);
            this.adaptedResult.finishedParts.series.push({"name":contractName,"series":[
                {"name":"roll","value":this.result[partContract]["IstMengeRoll"]??0},
                {"name":"lama","value":this.result[partContract]["IstMengeLama"]??0},
                {"name":"gesamt","value":this.result[partContract]["IstMenge"]??0}
            ]});
            
            let maxvalue=this.result[partContract]['SollMenge'];
            if(this.adaptedResult.finishedParts.max<Number(maxvalue)){
                this.adaptedResult.finishedParts.max=Number(maxvalue);
            }
        }
    }
    private setNumberCards(){
        this.adaptedResult['numericValues']={series:[]};
        let partsPerSet=this.requiredNumberOfPartsPerSet();
        this.setFinishedSets(partsPerSet);
        this.setOriginalRequiredDifference(partsPerSet);
        this.setNIO();

    }
    private setNIO(){
        let rollnio=0;
        let lamanio=0;
        for (var partContract in this.result){
            rollnio+=this.result[partContract]["Roll_niO"];
            lamanio+=this.result[partContract]["Lama_niO"];
        }
        this.pushNumericValue("Roll niO",rollnio);
        this.pushNumericValue("Lama niO",lamanio);
    }
    private setOriginalRequiredDifference(partsPerSet:number[]){
        let required=Number(this.result[0]["SollMenge"]/partsPerSet[0]);
        let originalRequired=Number(this.result[0]["OriginalSollMenge"]/partsPerSet[0]);

        this.pushNumericValue("Reduktion Sollmenge",(originalRequired-required));
    }
    private pushNumericValue(name,value){
        this.adaptedResult.numericValues.series.push({"name":name,"value":value});
    }
    private setFinishedSets(partsPerSet:number[]){
        
        let numberOfSets=this.result[0]["IstMenge"]/partsPerSet[0];
        let numberOfSetsRoll=this.result[0]["IstMengeRoll"]/partsPerSet[0];
        let numberOfSetsLama=this.result[0]["IstMengeLama"]/partsPerSet[0];
        for(var partContract in this.result){
            let currentPartNumber=this.result[partContract]["IstMenge"]/partsPerSet[partContract]
            let currentPartNumberRoll=this.result[partContract]["IstMengeRoll"]/partsPerSet[partContract]
            let currentPartNumberLama=this.result[partContract]["IstMengeLama"]/partsPerSet[partContract]
            if(numberOfSets>currentPartNumber){
                numberOfSets=currentPartNumber;
            }
            if(numberOfSetsRoll>currentPartNumberRoll){
                numberOfSetsRoll=currentPartNumberRoll;
            }
            if(numberOfSetsLama>currentPartNumberLama){
                numberOfSetsLama=currentPartNumberLama;
            }
        }
        let numberOfSetsRequired=this.result[0]["SollMenge"]/partsPerSet[0];
        this.pushNumericValue("Fertige Sätze Roll",numberOfSetsRoll+"/"+numberOfSetsRequired);
        this.pushNumericValue("Fertige Sätze Lama",numberOfSetsLama+"/"+numberOfSetsRequired);
        this.pushNumericValue("Fertige Sätze",numberOfSets+"/"+numberOfSetsRequired);
    }
    private requiredNumberOfPartsPerSet(){
        let minNumberOfParts=this.result[0]["SollMenge"];
        for(var partContract in this.result){
            if(minNumberOfParts>this.result[partContract]["SollMenge"]){
                minNumberOfParts=this.result[partContract]["SollMenge"];
            }
        }
        let numberPerSet:number[]=[];
        for(var partContract in this.result){
            numberPerSet[partContract]=this.result[partContract]["SollMenge"]/minNumberOfParts;
        }
        return numberPerSet;
    }

    private contractName(partContract){
        return this.result[partContract]["MaTxt"].trim()+"("+this.result[partContract]["Auftrag"].trim()+")";
    }
}
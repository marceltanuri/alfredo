module.exports = class Transaction {

    constructor (date, description, value){
        this.date = date
        this.description = description
        
        if(parseFloat(value)<0){
            this.type = "expense"
            this.value = parseFloat(value) * -1
        }
        else{
            this.type = "incoming"
            this.value = value
        }

    }
    
}
module.exports = class camposTeclado {

    constructor(id, value){
        this.id = id,
        this.value = value
    }

    includes(string){
        return this.value.includes(string)
    }

    getIdSufix(){
        return this.id.split("_")[1]
    }

}
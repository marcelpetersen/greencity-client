class GreenCityObject {
    
    private _id:any;
    private createdAt:Date;
    private updatedAt:Date;

    constructor() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    getCreatedAt():Date {
        return this.createdAt
    }

    setUpdatedAt(date:Date):void {
        if(this.updatedAt <= date) {
            this.updatedAt = date;
        } else {

        }
    }

    getUpdatedAt():Date {
        return this.updatedAt;
    }

    getId() {
        return this._id
    }

}


var GreenCityObject = (function () {
    function GreenCityObject() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    GreenCityObject.prototype.getCreatedAt = function () {
        return this.createdAt;
    };
    GreenCityObject.prototype.setUpdatedAt = function (date) {
        if (this.updatedAt <= date) {
            this.updatedAt = date;
        }
        else {
        }
    };
    GreenCityObject.prototype.getUpdatedAt = function () {
        return this.updatedAt;
    };
    GreenCityObject.prototype.getId = function () {
        return this._id;
    };
    return GreenCityObject;
}());

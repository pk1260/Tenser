class MovingAverageCalculator {
    constructor() {
        this._length = 5 // length of moving average
        this._average = 0
        this._valueAr = new Array(this._length).fill(0)//movingAverage memory
    }
    update(newValue) {
      this._valueAr.pop();//remove the last value
      this._valueAr.unshift(newValue);//add new value to start
    }
    get mean() {
        this.validate();
        //sum array / length
        return this._valueAr.reduce((a,b) => a + b, 0)/this._length;

    }
    validate() {
        if (this.count == 0) {
            throw new Error('average is undefined')
        }
    }
}
const movingAverageX = new MovingAverageCalculator();
const movingAverageY = new MovingAverageCalculator();

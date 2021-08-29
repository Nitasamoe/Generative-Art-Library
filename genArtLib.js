function Point(x,y) {
  this.x = x; this.y = y;

  this.addPoint = function(pointB){
    return this.addPoints(this, pointB)
  }
  this.subtractPoint = function(pointTwo) {
    return new Point(this.x - pointTwo.x, this.y - pointTwo.y)
  }
  this.getMiddlePointWithPoint = function(pointTwo) {
    return this.getMiddlePoint(this, pointTwo)
  },
  this.addPoints = function(pointOne, pointTwo) {
    return new Point(pointOne.x + pointTwo.x, pointOne.y + pointTwo.y)
  },
  this.getMiddlePoint = function(pointOne, pointTwo) {
    let sum = this.addPoints(pointOne, pointTwo)
    return new Point(sum.x/2, sum.y/2)
  },
  this.subtractPoints = function(pointOne, pointTwo) {
    return new Point(pointOne.x - pointTwo.x, pointOne.y - pointTwo.y)
  }
}

function DirVector(x,y) {
  this.x = x; this.y = y;
  this.getNormalVector = function(){
    return new DirVector(-this.y, this.x)
  }
  this.getLength = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  this.getUnitVector = function(){
    return new DirVector(this.x / this.getLength(), this.y / this.getLength())
  }
  this.multiplyVectorByNumber = function(num){
    return new DirVector(this.x *num, this.y * num)
  }
}



function Drawing_Library(canvas){
  this.canvas = canvas;
  const dl = this;
  this.Polygon = function(sides, size, point){
    let selfPolygon = this;
    this.midPoint = point;
    this.points = []
      for (var i = 0; i <= sides;i += 1) {
        this.points.push(new Point(point.x + size * Math.cos(i * 2 * Math.PI / sides), point.y + size * Math.sin(i * 2 * Math.PI / sides)));
      }
    this.outline = function(color){
      dl.outlineFromPoints(this.points, color)
      return this
    }
    this.fill = function(color){
      dl.fillFromPoints(this.points, color)
      return this
    }

    this.addMidPoints = function() {
      let polygon = this.points;
      let resPolygon = [];
      for(let i = 0; i < polygon.length; i++) {
        let pointTwo = polygon[i+1]
        if(i === polygon.length - 1){
          pointTwo = polygon[0]
        }
          let point = polygon[i]
          let dirVector = point.subtractPoint(pointTwo);
          let normalDirUnitVector = new DirVector(dirVector.x, dirVector.y).getNormalVector().getUnitVector();
          let middlePoint = point.getMiddlePointWithPoint(pointTwo)
          resPolygon.push(point)
          resPolygon.push(middlePoint)
      }
      let resPolygonObj = new dl.Polygon()
      resPolygonObj.points = resPolygon;
      resPolygonObj.midPoint = this.midPoint;
      return resPolygonObj;
    }

    this.scale = function(f, flowArr=[10,10,10,10]){
      let resPolygonObj = new dl.Polygon()
      resPolygonObj.midPoint = this.midPoint;
      resPolygonObj.points = this.points.map((point,i) => {
        let subPts = point.subtractPoint(this.midPoint);
        let dirVectorToMid = new DirVector(subPts.x, subPts.y)
        let normalDirUnitVectorToMid = dirVectorToMid.getUnitVector();
        let radius = dirVectorToMid.getLength()
        let protrusion = radius * f

        // add Flow Array
        let iFlowArr = parseInt(remap(i,0,this.points.length,0,flowArr.length));
        let flowFac = flowArr[iFlowArr]
        let nProtrusion = remap(flowFac,0,10,radius,protrusion);

        return this.midPoint.addPoint(normalDirUnitVectorToMid.multiplyVectorByNumber(nProtrusion))
      })
      return resPolygonObj;
    }

    this.protrudeMidPoints = function(protrusionFn) {
      let resPolygonObj = new dl.Polygon();
      resPolygonObj.midPoint = this.midPoint;
      let polygonWithMidpoints = this.addMidPoints()
      resPolygonObj.points = polygonWithMidpoints.points
        .map( (point,index) => {
          if( true || (index+1)%2===0) {
            let points = polygonWithMidpoints.points;
            let pointOne = points[index-1]
            let pointTwo = points[index+1]
            if(!pointTwo) pointTwo = points[0]
            if(!pointOne) pointOne = points[points.length-1]
            let vector = pointOne.subtractPoint(pointTwo);
            let dirVector = new DirVector(vector.x, vector.y)
            let normalDirUnitVector = dirVector.getNormalVector().getUnitVector();
            return point.addPoint(normalDirUnitVector.multiplyVectorByNumber(protrusionFn(index, points.length, point)))   
          } else {
            return point
          }
       
        })
      return resPolygonObj
      
    }

  }
  this.fillFromPoints = function(pointsArray, color) {
    if(pointsArray && pointsArray.length > 0) {
      canvas.fillStyle = color;
      canvas.beginPath();
      pointsArray.forEach(ve => {    
        canvas.lineTo(ve.x, ve.y);
      })
      canvas.closePath();
      canvas.fill();
    } else {
      alert("length 0")
    }
  }
  this.outlineFromPoints = function(pointsArray, color) {
    if(pointsArray && pointsArray.length > 0) {
      canvas.strokeStyle = color;
      canvas.beginPath();
      pointsArray.forEach(point => {    
        canvas.lineTo(point.x, point.y);
      })
      canvas.closePath();
      canvas.stroke();
    } else {
      alert("length 0")
    }
  }
}

function Random(seed){
  this.stateProperty = seed;
  this.m = 4294967296;
  this.a = 1664525;
  this.c = 1013904223;
  this.y2 = 0;
  this.random = function(min=1) {
    this.stateProperty = (this.a * this.stateProperty + this.c) % this.m;
    let rand = this.stateProperty / this.m;
    return rand * min;
  };
  this.randomGaussian = function(mean, sd = 1) {
    let y1, x1, x2, w;
    if (this._gaussian_previous) {
      y1 = this.y2;
      this._gaussian_previous = false;
    } else {
      do {
        x1 = this.random(2) - 1;
        x2 = this.random(2) - 1;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1);
      w = Math.sqrt(-2 * Math.log(w) / w);
      y1 = x1 * w;
      this.y2 = x2 * w;
      this._gaussian_previous = true;
    }

    const m = mean || 0;
    return y1 * sd + m;
  };
  this.randomPareto = function(alpha=1, beta=5) {
    // beta scale => The higher the more spread out
    // alpha shape =>
    return beta / pow( R.random(), 1.0/alpha );
  }
}




/*P5PerlinNoisehttps://github.com/processing/p5.js/blob/1.3.1/src/math/noise.js#L36*/
let p_octaves = 4,p_amp_falloff = 0.5, perlin;
const P_YWRAPB = 4,P_YWRAP = 1 << P_YWRAPB,P_ZWRAPB = 8,P_ZWRAP = 1 << P_ZWRAPB,P_SIZE = 4095, s_c = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
function n(P,_=0,l=0){if(null==perlin){perlin=new Array(P_SIZE+1);for(let P=0;P<P_SIZE+1;P++)perlin[P]=Math.random()}P<0&&(P=-P),_<0&&(_=-_),l<0&&(l=-l);let r,e,n,p,i,o=Math.floor(P),Z=Math.floor(_),t=Math.floor(l),f=P-o,E=_-Z,I=l-t,S=0,a=.5;for(let P=0;P<p_octaves;P++){let P=o+(Z<<P_YWRAPB)+(t<<P_ZWRAPB);r=s_c(f),e=s_c(E),n=perlin[P&P_SIZE],n+=r*(perlin[P+1&P_SIZE]-n),p=perlin[P+P_YWRAP&P_SIZE],n+=e*((p+=r*(perlin[P+P_YWRAP+1&P_SIZE]-p))-n),P+=P_ZWRAP,p=perlin[P&P_SIZE],p+=r*(perlin[P+1&P_SIZE]-p),i=perlin[P+P_YWRAP&P_SIZE],p+=e*((i+=r*(perlin[P+P_YWRAP+1&P_SIZE]-i))-p),S+=(n+=s_c(I)*(p-n))*a,a*=p_amp_falloff,o<<=1,Z<<=1,t<<=1,(f*=2)>=1&&(o++,f--),(E*=2)>=1&&(Z++,E--),(I*=2)>=1&&(t++,I--)}return S}
function nS(e){const n=(()=>{const e=4294967296;let n,r;return{sS(t){r=n=(null==t?Math.random()*e:t)>>>0},gS:()=>n,rand:()=>(r=(1664525*r+1013904223)%e)/e}})();n.sS(e),perlin=new Array(P_SIZE+1);for(let e=0;e<P_SIZE+1;e++)perlin[e]=n.rand()}

function remap(n, s1, st1, s2, st2) {
     return ((n - s1) / (st1 - s1)) * (st2 - s2) + s2;
}


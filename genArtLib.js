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
  this.outlineFromPoints = function(pointsArray, color, close=true) {
    if(pointsArray && pointsArray.length > 0) {
      canvas.strokeStyle = color;
      canvas.beginPath();
      pointsArray.forEach(point => {   
        ctx.moveTo(point.x, point.y); 
        canvas.lineTo(point.x, point.y);
      })
      if(close===true) {
        canvas.closePath();
      }
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
    return beta / pow( R.random(), 1.0/alpha );
  }
}

function Utils(){
    this.remap = function(n, s1, st1, s2, st2) {
      return ((n - s1) / (st1 - s1)) * (st2 - s2) + s2;
  }
}




/* P5PerlinNoise https://github.com/processing/p5.js/blob/1.3.1/src/math/noise.js#L36 */
let p_octaves = 4,p_amp_falloff = 0.5, perlin;
const P_YWRAPB = 4,P_YWRAP = 1 << P_YWRAPB,P_ZWRAPB = 8,P_ZWRAP = 1 << P_ZWRAPB,P_SIZE = 4095, s_c = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
function n(P,_=0,l=0){if(null==perlin){perlin=new Array(P_SIZE+1);for(let P=0;P<P_SIZE+1;P++)perlin[P]=Math.random()}P<0&&(P=-P),_<0&&(_=-_),l<0&&(l=-l);let r,e,n,p,i,o=Math.floor(P),Z=Math.floor(_),t=Math.floor(l),f=P-o,E=_-Z,I=l-t,S=0,a=.5;for(let P=0;P<p_octaves;P++){let P=o+(Z<<P_YWRAPB)+(t<<P_ZWRAPB);r=s_c(f),e=s_c(E),n=perlin[P&P_SIZE],n+=r*(perlin[P+1&P_SIZE]-n),p=perlin[P+P_YWRAP&P_SIZE],n+=e*((p+=r*(perlin[P+P_YWRAP+1&P_SIZE]-p))-n),P+=P_ZWRAP,p=perlin[P&P_SIZE],p+=r*(perlin[P+1&P_SIZE]-p),i=perlin[P+P_YWRAP&P_SIZE],p+=e*((i+=r*(perlin[P+P_YWRAP+1&P_SIZE]-i))-p),S+=(n+=s_c(I)*(p-n))*a,a*=p_amp_falloff,o<<=1,Z<<=1,t<<=1,(f*=2)>=1&&(o++,f--),(E*=2)>=1&&(Z++,E--),(I*=2)>=1&&(t++,I--)}return S}
function nS(e){const n=(()=>{const e=4294967296;let n,r;return{sS(t){r=n=(null==t?Math.random()*e:t)>>>0},gS:()=>n,rand:()=>(r=(1664525*r+1013904223)%e)/e}})();n.sS(e),perlin=new Array(P_SIZE+1);for(let e=0;e<P_SIZE+1;e++)perlin[e]=n.rand()}


/*!
Copyright (C) 2010-2013 Raymond Hill: https://github.com/gorhill/Javascript-Voronoi
MIT License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
*/
function Voronoi(){this.vertices=null,this.edges=null,this.cells=null,this.toRecycle=null,this.beachsectionJunkyard=[],this.circleEventJunkyard=[],this.vertexJunkyard=[],this.edgeJunkyard=[],this.cellJunkyard=[]}Voronoi.prototype.reset=function(){if(this.beachline||(this.beachline=new this.RBTree),this.beachline.root)for(var e=this.beachline.getFirst(this.beachline.root);e;)this.beachsectionJunkyard.push(e),e=e.rbNext;this.beachline.root=null,this.circleEvents||(this.circleEvents=new this.RBTree),this.circleEvents.root=this.firstCircleEvent=null,this.vertices=[],this.edges=[],this.cells=[]},Voronoi.prototype.sqrt=Math.sqrt,Voronoi.prototype.abs=Math.abs,Voronoi.prototype.ε=Voronoi.ε=1e-9,Voronoi.prototype.invε=Voronoi.invε=1/Voronoi.ε,Voronoi.prototype.equalWithEpsilon=function(e,t){return this.abs(e-t)<1e-9},Voronoi.prototype.greaterThanWithEpsilon=function(e,t){return e-t>1e-9},Voronoi.prototype.greaterThanOrEqualWithEpsilon=function(e,t){return t-e<1e-9},Voronoi.prototype.lessThanWithEpsilon=function(e,t){return t-e>1e-9},Voronoi.prototype.lessThanOrEqualWithEpsilon=function(e,t){return e-t<1e-9},Voronoi.prototype.RBTree=function(){this.root=null},Voronoi.prototype.RBTree.prototype.rbInsertSuccessor=function(e,t){var r,i,o;if(e){if(t.rbPrevious=e,t.rbNext=e.rbNext,e.rbNext&&(e.rbNext.rbPrevious=t),e.rbNext=t,e.rbRight){for(e=e.rbRight;e.rbLeft;)e=e.rbLeft;e.rbLeft=t}else e.rbRight=t;r=e}else this.root?(e=this.getFirst(this.root),t.rbPrevious=null,t.rbNext=e,e.rbPrevious=t,e.rbLeft=t,r=e):(t.rbPrevious=t.rbNext=null,this.root=t,r=null);for(t.rbLeft=t.rbRight=null,t.rbParent=r,t.rbRed=!0,e=t;r&&r.rbRed;)r===(i=r.rbParent).rbLeft?(o=i.rbRight)&&o.rbRed?(r.rbRed=o.rbRed=!1,i.rbRed=!0,e=i):(e===r.rbRight&&(this.rbRotateLeft(r),r=(e=r).rbParent),r.rbRed=!1,i.rbRed=!0,this.rbRotateRight(i)):(o=i.rbLeft)&&o.rbRed?(r.rbRed=o.rbRed=!1,i.rbRed=!0,e=i):(e===r.rbLeft&&(this.rbRotateRight(r),r=(e=r).rbParent),r.rbRed=!1,i.rbRed=!0,this.rbRotateLeft(i)),r=e.rbParent;this.root.rbRed=!1},Voronoi.prototype.RBTree.prototype.rbRemoveNode=function(e){e.rbNext&&(e.rbNext.rbPrevious=e.rbPrevious),e.rbPrevious&&(e.rbPrevious.rbNext=e.rbNext),e.rbNext=e.rbPrevious=null;var t,r,i=e.rbParent,o=e.rbLeft,s=e.rbRight;if(t=o?s?this.getFirst(s):o:s,i?i.rbLeft===e?i.rbLeft=t:i.rbRight=t:this.root=t,o&&s?(r=t.rbRed,t.rbRed=e.rbRed,t.rbLeft=o,o.rbParent=t,t!==s?(i=t.rbParent,t.rbParent=e.rbParent,e=t.rbRight,i.rbLeft=e,t.rbRight=s,s.rbParent=t):(t.rbParent=i,i=t,e=t.rbRight)):(r=e.rbRed,e=t),e&&(e.rbParent=i),!r)if(e&&e.rbRed)e.rbRed=!1;else{var n;do{if(e===this.root)break;if(e===i.rbLeft){if((n=i.rbRight).rbRed&&(n.rbRed=!1,i.rbRed=!0,this.rbRotateLeft(i),n=i.rbRight),n.rbLeft&&n.rbLeft.rbRed||n.rbRight&&n.rbRight.rbRed){n.rbRight&&n.rbRight.rbRed||(n.rbLeft.rbRed=!1,n.rbRed=!0,this.rbRotateRight(n),n=i.rbRight),n.rbRed=i.rbRed,i.rbRed=n.rbRight.rbRed=!1,this.rbRotateLeft(i),e=this.root;break}}else if((n=i.rbLeft).rbRed&&(n.rbRed=!1,i.rbRed=!0,this.rbRotateRight(i),n=i.rbLeft),n.rbLeft&&n.rbLeft.rbRed||n.rbRight&&n.rbRight.rbRed){n.rbLeft&&n.rbLeft.rbRed||(n.rbRight.rbRed=!1,n.rbRed=!0,this.rbRotateLeft(n),n=i.rbLeft),n.rbRed=i.rbRed,i.rbRed=n.rbLeft.rbRed=!1,this.rbRotateRight(i),e=this.root;break}n.rbRed=!0,e=i,i=i.rbParent}while(!e.rbRed);e&&(e.rbRed=!1)}},Voronoi.prototype.RBTree.prototype.rbRotateLeft=function(e){var t=e,r=e.rbRight,i=t.rbParent;i?i.rbLeft===t?i.rbLeft=r:i.rbRight=r:this.root=r,r.rbParent=i,t.rbParent=r,t.rbRight=r.rbLeft,t.rbRight&&(t.rbRight.rbParent=t),r.rbLeft=t},Voronoi.prototype.RBTree.prototype.rbRotateRight=function(e){var t=e,r=e.rbLeft,i=t.rbParent;i?i.rbLeft===t?i.rbLeft=r:i.rbRight=r:this.root=r,r.rbParent=i,t.rbParent=r,t.rbLeft=r.rbRight,t.rbLeft&&(t.rbLeft.rbParent=t),r.rbRight=t},Voronoi.prototype.RBTree.prototype.getFirst=function(e){for(;e.rbLeft;)e=e.rbLeft;return e},Voronoi.prototype.RBTree.prototype.getLast=function(e){for(;e.rbRight;)e=e.rbRight;return e},Voronoi.prototype.Diagram=function(e){this.site=e},Voronoi.prototype.Cell=function(e){this.site=e,this.halfedges=[],this.closeMe=!1},Voronoi.prototype.Cell.prototype.init=function(e){return this.site=e,this.halfedges=[],this.closeMe=!1,this},Voronoi.prototype.createCell=function(e){var t=this.cellJunkyard.pop();return t?t.init(e):new this.Cell(e)},Voronoi.prototype.Cell.prototype.prepareHalfedges=function(){for(var e,t=this.halfedges,r=t.length;r--;)(e=t[r].edge).vb&&e.va||t.splice(r,1);return t.sort(function(e,t){return t.angle-e.angle}),t.length},Voronoi.prototype.Cell.prototype.getNeighborIds=function(){for(var e,t=[],r=this.halfedges.length;r--;)null!==(e=this.halfedges[r].edge).lSite&&e.lSite.voronoiId!=this.site.voronoiId?t.push(e.lSite.voronoiId):null!==e.rSite&&e.rSite.voronoiId!=this.site.voronoiId&&t.push(e.rSite.voronoiId);return t},Voronoi.prototype.Cell.prototype.getBbox=function(){for(var e,t,r,i=this.halfedges,o=i.length,s=1/0,n=1/0,h=-1/0,a=-1/0;o--;)(t=(e=i[o].getStartpoint()).x)<s&&(s=t),(r=e.y)<n&&(n=r),t>h&&(h=t),r>a&&(a=r);return{x:s,y:n,width:h-s,height:a-n}},Voronoi.prototype.Cell.prototype.pointIntersection=function(e,t){for(var r,i,o,s,n=this.halfedges,h=n.length;h--;){if(i=(r=n[h]).getStartpoint(),o=r.getEndpoint(),!(s=(t-i.y)*(o.x-i.x)-(e-i.x)*(o.y-i.y)))return 0;if(s>0)return-1}return 1},Voronoi.prototype.Vertex=function(e,t){this.x=e,this.y=t},Voronoi.prototype.Edge=function(e,t){this.lSite=e,this.rSite=t,this.va=this.vb=null},Voronoi.prototype.Halfedge=function(e,t,r){if(this.site=t,this.edge=e,r)this.angle=Math.atan2(r.y-t.y,r.x-t.x);else{var i=e.va,o=e.vb;this.angle=e.lSite===t?Math.atan2(o.x-i.x,i.y-o.y):Math.atan2(i.x-o.x,o.y-i.y)}},Voronoi.prototype.createHalfedge=function(e,t,r){return new this.Halfedge(e,t,r)},Voronoi.prototype.Halfedge.prototype.getStartpoint=function(){return this.edge.lSite===this.site?this.edge.va:this.edge.vb},Voronoi.prototype.Halfedge.prototype.getEndpoint=function(){return this.edge.lSite===this.site?this.edge.vb:this.edge.va},Voronoi.prototype.createVertex=function(e,t){var r=this.vertexJunkyard.pop();return r?(r.x=e,r.y=t):r=new this.Vertex(e,t),this.vertices.push(r),r},Voronoi.prototype.createEdge=function(e,t,r,i){var o=this.edgeJunkyard.pop();return o?(o.lSite=e,o.rSite=t,o.va=o.vb=null):o=new this.Edge(e,t),this.edges.push(o),r&&this.setEdgeStartpoint(o,e,t,r),i&&this.setEdgeEndpoint(o,e,t,i),this.cells[e.voronoiId].halfedges.push(this.createHalfedge(o,e,t)),this.cells[t.voronoiId].halfedges.push(this.createHalfedge(o,t,e)),o},Voronoi.prototype.createBorderEdge=function(e,t,r){var i=this.edgeJunkyard.pop();return i?(i.lSite=e,i.rSite=null):i=new this.Edge(e,null),i.va=t,i.vb=r,this.edges.push(i),i},Voronoi.prototype.setEdgeStartpoint=function(e,t,r,i){e.va||e.vb?e.lSite===r?e.vb=i:e.va=i:(e.va=i,e.lSite=t,e.rSite=r)},Voronoi.prototype.setEdgeEndpoint=function(e,t,r,i){this.setEdgeStartpoint(e,r,t,i)},Voronoi.prototype.Beachsection=function(){},Voronoi.prototype.createBeachsection=function(e){var t=this.beachsectionJunkyard.pop();return t||(t=new this.Beachsection),t.site=e,t},Voronoi.prototype.leftBreakPoint=function(e,t){var r=e.site,i=r.x,o=r.y,s=o-t;if(!s)return i;var n=e.rbPrevious;if(!n)return-1/0;var h=(r=n.site).x,a=r.y,l=a-t;if(!l)return h;var c=h-i,b=1/s-1/l,f=c/l;return b?(-f+this.sqrt(f*f-2*b*(c*c/(-2*l)-a+l/2+o-s/2)))/b+i:(i+h)/2},Voronoi.prototype.rightBreakPoint=function(e,t){var r=e.rbNext;if(r)return this.leftBreakPoint(r,t);var i=e.site;return i.y===t?i.x:1/0},Voronoi.prototype.detachBeachsection=function(e){this.detachCircleEvent(e),this.beachline.rbRemoveNode(e),this.beachsectionJunkyard.push(e)},Voronoi.prototype.removeBeachsection=function(e){var t=e.circleEvent,r=t.x,i=t.ycenter,o=this.createVertex(r,i),s=e.rbPrevious,n=e.rbNext,h=[e],a=Math.abs;this.detachBeachsection(e);for(var l=s;l.circleEvent&&a(r-l.circleEvent.x)<1e-9&&a(i-l.circleEvent.ycenter)<1e-9;)s=l.rbPrevious,h.unshift(l),this.detachBeachsection(l),l=s;h.unshift(l),this.detachCircleEvent(l);for(var c=n;c.circleEvent&&a(r-c.circleEvent.x)<1e-9&&a(i-c.circleEvent.ycenter)<1e-9;)n=c.rbNext,h.push(c),this.detachBeachsection(c),c=n;h.push(c),this.detachCircleEvent(c);var b,f=h.length;for(b=1;b<f;b++)c=h[b],l=h[b-1],this.setEdgeStartpoint(c.edge,l.site,c.site,o);l=h[0],(c=h[f-1]).edge=this.createEdge(l.site,c.site,void 0,o),this.attachCircleEvent(l),this.attachCircleEvent(c)},Voronoi.prototype.addBeachsection=function(e){for(var t,r,i,o,s=e.x,n=e.y,h=this.beachline.root;h;)if((i=this.leftBreakPoint(h,n)-s)>1e-9)h=h.rbLeft;else{if(!((o=s-this.rightBreakPoint(h,n))>1e-9)){i>-1e-9?(t=h.rbPrevious,r=h):o>-1e-9?(t=h,r=h.rbNext):t=r=h;break}if(!h.rbRight){t=h;break}h=h.rbRight}var a=this.createBeachsection(e);if(this.beachline.rbInsertSuccessor(t,a),t||r){if(t===r)return this.detachCircleEvent(t),r=this.createBeachsection(t.site),this.beachline.rbInsertSuccessor(a,r),a.edge=r.edge=this.createEdge(t.site,a.site),this.attachCircleEvent(t),void this.attachCircleEvent(r);if(!t||r){if(t!==r){this.detachCircleEvent(t),this.detachCircleEvent(r);var l=t.site,c=l.x,b=l.y,f=e.x-c,u=e.y-b,p=r.site,d=p.x-c,v=p.y-b,g=2*(f*v-u*d),y=f*f+u*u,R=d*d+v*v,x=this.createVertex((v*y-u*R)/g+c,(f*R-d*y)/g+b);return this.setEdgeStartpoint(r.edge,l,p,x),a.edge=this.createEdge(l,e,void 0,x),r.edge=this.createEdge(e,p,void 0,x),this.attachCircleEvent(t),void this.attachCircleEvent(r)}}else a.edge=this.createEdge(t.site,a.site)}},Voronoi.prototype.CircleEvent=function(){this.arc=null,this.rbLeft=null,this.rbNext=null,this.rbParent=null,this.rbPrevious=null,this.rbRed=!1,this.rbRight=null,this.site=null,this.x=this.y=this.ycenter=0},Voronoi.prototype.attachCircleEvent=function(e){var t=e.rbPrevious,r=e.rbNext;if(t&&r){var i=t.site,o=e.site,s=r.site;if(i!==s){var n=o.x,h=o.y,a=i.x-n,l=i.y-h,c=s.x-n,b=s.y-h,f=2*(a*b-l*c);if(!(f>=-2e-12)){var u=a*a+l*l,p=c*c+b*b,d=(b*u-l*p)/f,v=(a*p-c*u)/f,g=v+h,y=this.circleEventJunkyard.pop();y||(y=new this.CircleEvent),y.arc=e,y.site=o,y.x=d+n,y.y=g+this.sqrt(d*d+v*v),y.ycenter=g,e.circleEvent=y;for(var R=null,x=this.circleEvents.root;x;)if(y.y<x.y||y.y===x.y&&y.x<=x.x){if(!x.rbLeft){R=x.rbPrevious;break}x=x.rbLeft}else{if(!x.rbRight){R=x;break}x=x.rbRight}this.circleEvents.rbInsertSuccessor(R,y),R||(this.firstCircleEvent=y)}}}},Voronoi.prototype.detachCircleEvent=function(e){var t=e.circleEvent;t&&(t.rbPrevious||(this.firstCircleEvent=t.rbNext),this.circleEvents.rbRemoveNode(t),this.circleEventJunkyard.push(t),e.circleEvent=null)},Voronoi.prototype.connectEdge=function(e,t){var r=e.vb;if(r)return!0;var i,o,s=e.va,n=t.xl,h=t.xr,a=t.yt,l=t.yb,c=e.lSite,b=e.rSite,f=c.x,u=c.y,p=b.x,d=b.y,v=(f+p)/2,g=(u+d)/2;if(this.cells[c.voronoiId].closeMe=!0,this.cells[b.voronoiId].closeMe=!0,d!==u&&(o=g-(i=(f-p)/(d-u))*v),void 0===i){if(v<n||v>=h)return!1;if(f>p){if(!s||s.y<a)s=this.createVertex(v,a);else if(s.y>=l)return!1;r=this.createVertex(v,l)}else{if(!s||s.y>l)s=this.createVertex(v,l);else if(s.y<a)return!1;r=this.createVertex(v,a)}}else if(i<-1||i>1)if(f>p){if(!s||s.y<a)s=this.createVertex((a-o)/i,a);else if(s.y>=l)return!1;r=this.createVertex((l-o)/i,l)}else{if(!s||s.y>l)s=this.createVertex((l-o)/i,l);else if(s.y<a)return!1;r=this.createVertex((a-o)/i,a)}else if(u<d){if(!s||s.x<n)s=this.createVertex(n,i*n+o);else if(s.x>=h)return!1;r=this.createVertex(h,i*h+o)}else{if(!s||s.x>h)s=this.createVertex(h,i*h+o);else if(s.x<n)return!1;r=this.createVertex(n,i*n+o)}return e.va=s,e.vb=r,!0},Voronoi.prototype.clipEdge=function(e,t){var r=e.va.x,i=e.va.y,o=0,s=1,n=e.vb.x-r,h=e.vb.y-i,a=r-t.xl;if(0===n&&a<0)return!1;var l=-a/n;if(n<0){if(l<o)return!1;l<s&&(s=l)}else if(n>0){if(l>s)return!1;l>o&&(o=l)}if(a=t.xr-r,0===n&&a<0)return!1;if(l=a/n,n<0){if(l>s)return!1;l>o&&(o=l)}else if(n>0){if(l<o)return!1;l<s&&(s=l)}if(a=i-t.yt,0===h&&a<0)return!1;if(l=-a/h,h<0){if(l<o)return!1;l<s&&(s=l)}else if(h>0){if(l>s)return!1;l>o&&(o=l)}if(a=t.yb-i,0===h&&a<0)return!1;if(l=a/h,h<0){if(l>s)return!1;l>o&&(o=l)}else if(h>0){if(l<o)return!1;l<s&&(s=l)}return o>0&&(e.va=this.createVertex(r+o*n,i+o*h)),s<1&&(e.vb=this.createVertex(r+s*n,i+s*h)),(o>0||s<1)&&(this.cells[e.lSite.voronoiId].closeMe=!0,this.cells[e.rSite.voronoiId].closeMe=!0),!0},Voronoi.prototype.clipEdges=function(e){for(var t,r=this.edges,i=r.length,o=Math.abs;i--;)t=r[i],(!this.connectEdge(t,e)||!this.clipEdge(t,e)||o(t.va.x-t.vb.x)<1e-9&&o(t.va.y-t.vb.y)<1e-9)&&(t.va=t.vb=null,r.splice(i,1))},Voronoi.prototype.closeCells=function(e){for(var t,r,i,o,s,n,h,a,l,c=e.xl,b=e.xr,f=e.yt,u=e.yb,p=this.cells,d=p.length,v=Math.abs;d--;)if((t=p[d]).prepareHalfedges()&&t.closeMe){for(o=(i=t.halfedges).length,r=0;r<o;){if(n=i[r].getEndpoint(),a=i[(r+1)%o].getStartpoint(),v(n.x-a.x)>=1e-9||v(n.y-a.y)>=1e-9)switch(!0){case this.equalWithEpsilon(n.x,c)&&this.lessThanWithEpsilon(n.y,u):if(l=this.equalWithEpsilon(a.x,c),h=this.createVertex(c,l?a.y:u),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;n=h;case this.equalWithEpsilon(n.y,u)&&this.lessThanWithEpsilon(n.x,b):if(l=this.equalWithEpsilon(a.y,u),h=this.createVertex(l?a.x:b,u),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;n=h;case this.equalWithEpsilon(n.x,b)&&this.greaterThanWithEpsilon(n.y,f):if(l=this.equalWithEpsilon(a.x,b),h=this.createVertex(b,l?a.y:f),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;n=h;case this.equalWithEpsilon(n.y,f)&&this.greaterThanWithEpsilon(n.x,c):if(l=this.equalWithEpsilon(a.y,f),h=this.createVertex(l?a.x:c,f),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;if(n=h,l=this.equalWithEpsilon(a.x,c),h=this.createVertex(c,l?a.y:u),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;if(n=h,l=this.equalWithEpsilon(a.y,u),h=this.createVertex(l?a.x:b,u),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;if(n=h,l=this.equalWithEpsilon(a.x,b),h=this.createVertex(b,l?a.y:f),s=this.createBorderEdge(t.site,n,h),r++,i.splice(r,0,this.createHalfedge(s,t.site,null)),o++,l)break;default:throw"Voronoi.closeCells() > this makes no sense!"}r++}t.closeMe=!1}},Voronoi.prototype.quantizeSites=function(e){for(var t,r=this.ε,i=e.length;i--;)(t=e[i]).x=Math.floor(t.x/r)*r,t.y=Math.floor(t.y/r)*r},Voronoi.prototype.recycle=function(e){if(e){if(!(e instanceof this.Diagram))throw"Voronoi.recycleDiagram() > Need a Diagram object.";this.toRecycle=e}},Voronoi.prototype.compute=function(e,t){var r=new Date;this.reset(),this.toRecycle&&(this.vertexJunkyard=this.vertexJunkyard.concat(this.toRecycle.vertices),this.edgeJunkyard=this.edgeJunkyard.concat(this.toRecycle.edges),this.cellJunkyard=this.cellJunkyard.concat(this.toRecycle.cells),this.toRecycle=null);var i=e.slice(0);i.sort(function(e,t){var r=t.y-e.y;return r||t.x-e.x});for(var o,s,n,h=i.pop(),a=0,l=this.cells;;)if(n=this.firstCircleEvent,h&&(!n||h.y<n.y||h.y===n.y&&h.x<n.x))h.x===o&&h.y===s||(l[a]=this.createCell(h),h.voronoiId=a++,this.addBeachsection(h),s=h.y,o=h.x),h=i.pop();else{if(!n)break;this.removeBeachsection(n.arc)}this.clipEdges(t),this.closeCells(t);var c=new Date,b=new this.Diagram;return b.cells=this.cells,b.edges=this.edges,b.vertices=this.vertices,b.execTime=c.getTime()-r.getTime(),this.reset(),b};

var voronoi = new Voronoi();
var bbox = {xl: 0, xr: 800, yt: 0, yb: 600}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites = [ {x: 200, y: 200}, {x: 50, y: 250}, {x: 400, y: 100} /* , ... */ ];

// a 'vertex' is an object exhibiting 'x' and 'y' properties. The
// Voronoi object will add a unique 'voronoiId' property to all
// sites. The 'voronoiId' can be used as a key to lookup the associated cell
// in diagram.cells.

var diagram = voronoi.compute(sites, bbox);

console.log(diagram)

function _toConsumableArray(t){return _arrayWithoutHoles(t)||_iterableToArray(t)||_unsupportedIterableToArray(t)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(t,e):void 0}}function _iterableToArray(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}function _arrayWithoutHoles(t){if(Array.isArray(t))return _arrayLikeToArray(t)}function _arrayLikeToArray(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}define(["exports","preact/jsx-runtime","preact"],function(t,e,n){"use strict";class r{static getChildMapping(t,e=new Map,a=(()=>{})){const i=Symbol();let s={};0!==e.size&&(s=r._getMappedDeletions(t,e,i));const o=t.reduce((t,r)=>{if(s[r.key]){const a=s[r.key];for(const r of a){const a=e.get(r);t.set(r,n.cloneElement(a,{in:!1}))}const i=e.get(r.key);t.set(r.key,n.cloneElement(r,{in:i.props.in}))}else{const e=n.cloneElement(r,{onExited:a.bind(null,r),in:!0});t.set(r.key,e)}return t},new Map);for(const t of s[i]||[]){const r=e.get(t);o.set(t,n.cloneElement(r,{in:!1}))}return o}static _getMappedDeletions(t,e,n){const r=new Set(t.map(t=>t.key));return _toConsumableArray(e.keys()).reduce((t,e)=>{if(r.has(e))t[e]=t[n],delete t[n];else{const r=t[n]?[].concat(_toConsumableArray(t[n]),[e]):[e];t[n]=r}return t},{})}}class a extends n.Component{constructor(t){super(t),this._handleExited=(t,e,n)=>{var a,i;const{children:s}=this.props;r.getChildMapping(s).has(t.key)||(null===(i=(a=t.props).onExited)||void 0===i||i.call(a,e,n),this._mounted&&this.setState(e=>{const n=new Map(e.childMapping);return n.delete(t.key),{childMapping:n}}))},this.state={childMapping:void 0,handleExited:this._handleExited},this._mounted=!1}static getDerivedStateFromProps(t,e){const{childMapping:n,handleExited:a}=e;return{childMapping:r.getChildMapping(t.children,n,a)}}componentDidMount(){this._mounted=!0}componentWillUnmount(){this._mounted=!1}render(){const t=this.props.elementType,{childMapping:n}=this.state,r=_toConsumableArray(n.values());return e.jsx(t,{children:r})}}a.defaultProps={elementType:"div"};class i extends n.Component{constructor(t){let e;super(t),e=t.in?"entering":null,this._appearStatus=e,this.state={status:"exited"},this._nextCallback=null}componentDidMount(){this._updateStatus(this._appearStatus)}componentDidUpdate(t){let e=null;if(t!==this.props){const{status:t}=this.state;this.props.in?"entering"!==t&&"entered"!==t&&(e="entering"):"entering"!==t&&"entered"!==t||(e="exiting")}this._updateStatus(e)}componentWillUnmount(){this._cancelNextCallback()}render(t){return null==t?void 0:t.children}_setNextCallback(t){let e=!0;return this._nextCallback=(...n)=>{e&&(e=!1,this._nextCallback=null,t.apply(void 0,n))},this._nextCallback.cancel=()=>{e=!1},this._nextCallback}_cancelNextCallback(){var t,e;null===(e=null===(t=this._nextCallback)||void 0===t?void 0:t.cancel)||void 0===e||e.call(t),this._nextCallback=null}_updateStatus(t){null!=t&&(this._cancelNextCallback(),"entering"===t?this._performEnter(this.base):this._performExit(this.base))}_performEnter(t){var e,n;null===(n=(e=this.props).onEnter)||void 0===n||n.call(e,t,this.props.metadata),this.setState({status:"entering"},()=>{var e,n;null===(n=(e=this.props).onEntering)||void 0===n||n.call(e,t,this._setNextCallback(()=>{this.setState({status:"entered"},()=>{var e,n;null===(n=(e=this.props).onEntered)||void 0===n||n.call(e,t,this.props.metadata)})}),this.props.metadata)})}_performExit(t){var e,n;null===(n=(e=this.props).onExit)||void 0===n||n.call(e,t,this.props.metadata),this.setState({status:"exiting"},()=>{var e,n;null===(n=(e=this.props).onExiting)||void 0===n||n.call(e,t,this._setNextCallback(()=>{this.setState({status:"exited"},()=>{var e,n;null===(n=(e=this.props).onExited)||void 0===n||n.call(e,t,this.props.metadata)})}),this.props.metadata)})}}t.Transition=i,t.TransitionGroup=a,Object.defineProperty(t,"__esModule",{value:!0})});
//# sourceMappingURL=PRIVATE_TransitionGroup.js.map
/**
 * 
 * @authors Benjamin (zuojj.com@gmail.com)
 * @date    2016-11-18 14:25:13
 * @version $Id$
 */


require('../../static/css/base.css');

var Slider = require('../../ui/slider/slider.js');

new Slider({
	container: '.container',
	interval: 3000,
	autoplay: false
});

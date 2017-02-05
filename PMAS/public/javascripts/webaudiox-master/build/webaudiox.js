var WebAudiox	= WebAudiox	|| {}

WebAudiox.AbsoluteNormalizer	= function(){
	var maxThreshold	= -Infinity;
	var minThreshold	= +Infinity;
	this.update	= function(value){
		// TODO make be good to smooth those values over time, thus it would forget
		// it would be the adaptative
		// and this one being absolute
		if( value < minThreshold ) minThreshold	= value
		if( value > maxThreshold ) maxThreshold = value
		// to avoid division by zero
		if( maxThreshold === minThreshold )	return value;
		// compute normalized value
		var normalized	= (value - minThreshold) / (maxThreshold-minThreshold);
		// return the just built normalized value between [0, 1]
		return normalized;
	}
}


var WebAudiox	= WebAudiox	|| {}

// TODO to rewrite with a simple weight average on a history array
// - simple and no magic involved

WebAudiox.AdaptativeNormalizer	= function(factorForMin, factorForMax){
	var minThreshold	= 0;
	var maxThreshold	= 1;
	this.update	= function(value){
		// smooth adapatation
		var smoothOut	= 0.01
		var smoothIn	= 0.01
		if( value < minThreshold )	minThreshold += (value-minThreshold)*smoothOut
		else				minThreshold += (value-minThreshold)*smoothIn
		if( value > maxThreshold )	maxThreshold += (value-maxThreshold)*smoothOut
		else				maxThreshold += (value-maxThreshold)*smoothIn
		// ensure bound are respected
		if( value < minThreshold ) value = minThreshold
		if( value > maxThreshold ) value = maxThreshold
		// to avoid division by zero
		if( maxThreshold === minThreshold )	return value;
		// compute normalized value
console.log(minThreshold.toFixed(10),maxThreshold.toFixed(10))
		var normalized	= (value - minThreshold) / (maxThreshold-minThreshold);
		// return the just built normalized value between [0, 1]
		return normalized;
	}
}

// @namespace defined WebAudiox name space
var WebAudiox	= WebAudiox	|| {}

/**
 * display an analyser node in a canvas
 * 
 * @param  {AnalyserNode} analyser     the analyser node
 * @param  {Number}	smoothFactor the smooth factor for smoothed volume
 */
WebAudiox.Analyser2Volume	= function(analyser, smoothFactor){
	// arguments default values
	smoothFactor	= smoothFactor !== undefined ? smoothFactor : 0.1
	/**
	 * return the raw volume
	 * @return {Number} value between 0 and 1
	 */
	this.rawValue		= function(){
		var rawVolume	= WebAudiox.Analyser2Volume.compute(analyser)
		return rawVolume
	}
	
	var smoothedVolume	= null
	/**
	 * [smoothedValue description]
	 * @return {[type]} [description]
	 */
	this.smoothedValue	= function(){
		var rawVolume	= WebAudiox.Analyser2Volume.compute(analyser)
		// compute smoothedVolume
		if( smoothedVolume === null )	smoothedVolume	= rawVolume
		smoothedVolume	+= (rawVolume  - smoothedVolume) * smoothFactor		
		// return the just computed value
		return smoothedVolume
	}
}

/**
 * do a average on a ByteFrequencyData from an analyser node
 * @param  {AnalyserNode} analyser the analyser node
 * @param  {Number} width    how many elements of the array will be considered
 * @param  {Number} offset   the index of the element to consider
 * @return {Number}          the ByteFrequency average
 */
WebAudiox.Analyser2Volume.compute	= function(analyser, width, offset){
	// handle paramerter
	width		= width  !== undefined ? width	: analyser.frequencyBinCount;
	offset		= offset !== undefined ? offset	: 0;
	// inint variable
	var freqByte	= new Uint8Array(analyser.frequencyBinCount);
	// get the frequency data
	analyser.getByteFrequencyData(freqByte);
	// compute the sum
	var sum	= 0;
	for(var i = offset; i < offset+width; i++){
		sum	+= freqByte[i];
	}
	// complute the amplitude
	var amplitude	= sum / (width*256-1);
	// return ampliture
	return amplitude;
}

var WebAudiox	= WebAudiox	|| {}

/**
 * Generate a binaural sounds
 * http://htmlpreview.github.io/?https://github.com/ichabodcole/BinauralBeatJS/blob/master/examples/index.html
 * http://en.wikipedia.org/wiki/Binaural_beats
 * 
 * @param {Number} pitch    the frequency of the pitch (e.g. 440hz)
 * @param {Number} beatRate the beat rate of the binaural sound (e.g. around 2-10hz)
 * @param {Number} gain     the gain applied on the result
 */
WebAudiox.BinauralSource	= function(context, pitch, beatRate, gain){
	pitch	= pitch !== undefined ? pitch : 440
	beatRate= beatRate !== undefined ? beatRate : 5
	gain	= gain !== undefined ? gain : 1

	var gainNode	= context.createGain()
	this.output	= gainNode
	var destination	= gainNode
	
	var compressor	= context.createDynamicsCompressor();
	compressor.connect(destination)
	destination	= compressor

	var channelMerge= context.createChannelMerger()
	channelMerge.connect(destination)
	destination	= channelMerge
	
	var leftOscil	= context.createOscillator()
	leftOscil.connect(destination)

	var rightOscil	= context.createOscillator()
	rightOscil.connect(destination)
	
	var updateNodes	= function(){
		gainNode.gain.value		= gain
		leftOscil.frequency.value	= pitch - beatRate/2
		rightOscil.frequency.value	= pitch + beatRate/2	
	}
	// do the initial update
	updateNodes();

	this.getGain	= function(){
		return gain
	}
	this.setGain	= function(value){
		gain	= value
		updateNodes();		
	}
	this.getPitch	= function(){
		return pitch
	}
	this.setPitch	= function(value){
		pitch	= value
		updateNodes();		
	}
	this.getBeatRate= function(){
		return beatRate
	}
	this.setBeatRate= function(value){
		beatRate	= value
		updateNodes();		
	}
	/**
	 * start the source
	 */
	this.start	= function(delay){
		delay	= delay !== undefined ? delay : 0
		leftOscil.start(delay)
		rightOscil.start(delay)
	}
	/** 
	 * stop the source
	 */
	this.stop	= function(delay){
		delay	= delay !== undefined ? delay : 0
		leftOscil.stop(delay)
		rightOscil.stop(delay)
	}
}
var WebAudiox	= WebAudiox	|| {}


/**
 * source is integers from 0 to 255,  destination is float from 0 to 1 non included
 * source and destination may not have the same length.
 * 
 * @param {Array} srcArray       the source array
 * @param {Array} dstArray       the destination array
 * @param {Number|undefined} dstArrayLength the length of the destination array. If not provided
 *                               dstArray.length value is used.
 */
WebAudiox.ByteToNormalizedFloat32Array	= function(srcArray, dstArray, dstArrayLength){
	dstArrayLength	= dstArrayLength !== undefined ? dstArrayLength : dstArray.length
	var ratio	= srcArray.length / dstArrayLength
	for(var i = 0; i < dstArray.length; i++){
		var first	= Math.round((i+0) * ratio)
		var last	= Math.round((i+1) * ratio)
		last		= Math.min(srcArray.length-1, last)
		for(var j = first, sum = 0; j <= last; j++){
			sum	+= srcArray[j]/256;
		}
		dstArray[i]	= sum/(last-first+1);
	}
}
var WebAudiox	= WebAudiox	|| {}

/**
 * generate buffer with jsfx.js 
 * @param  {AudioContext} context the WebAudio API context
 * @param  {Array} lib     parameter for jsfx
 * @return {[type]}         the just built buffer
 */
WebAudiox.getBufferFromJsfx	= function(context, lib){
	var params	= jsfxlib.arrayToParams(lib);
	var data	= jsfx.generate(params);
	var buffer	= context.createBuffer(1, data.length, 44100);
	var fArray	= buffer.getChannelData(0);
	for(var i = 0; i < fArray.length; i++){
		fArray[i]	= data[i];
	}
	return buffer;
}
/**
 * @namespace definition of WebAudiox
 * @type {object}
 */
var WebAudiox	= WebAudiox	|| {}

/**
 * definition of a lineOut
 * @constructor
 * @param  {AudioContext} context WebAudio API context
 */
WebAudiox.LineOut	= function(context){
	// init this.destination
	this.destination= context.destination

	// this.destination to support muteWithVisibility
	var visibilityGain	= context.createGain()
	visibilityGain.connect(this.destination)			
	muteWithVisibility(visibilityGain)
	this.destination= visibilityGain

	// this.destination to support webAudiox.toggleMute() and webAudiox.isMuted
	var muteGain	= context.createGain()
	muteGain.connect(this.destination)
	this.destination= muteGain
	this.isMuted	= false
	this.toggleMute = function(){
		this.isMuted		= this.isMuted ? false : true;
		muteGain.gain.value	= this.isMuted ? 0 : 1;
	}.bind(this)

	//  to support webAudiox.volume
	var volumeNode	= context.createGain()
	volumeNode.connect( this.destination )	
	this.destination= volumeNode
	Object.defineProperty(this, 'volume', {
		get : function(){
			return volumeNode.gain.value; 
		},
                set : function(value){
			volumeNode.gain.value	= value;
		}
	});

	return;	

	//////////////////////////////////////////////////////////////////////////////////
	//		muteWithVisibility helper					//
	//////////////////////////////////////////////////////////////////////////////////
	/**
	 * mute a gainNode when the page isnt visible
	 * @param  {Node} gainNode the gainNode to mute/unmute
	 */
	function muteWithVisibility(gainNode){
		// shim to handle browser vendor
		var eventStr	= (document.hidden !== undefined	? 'visibilitychange'	:
			(document.mozHidden	!== undefined		? 'mozvisibilitychange'	:
			(document.msHidden	!== undefined		? 'msvisibilitychange'	:
			(document.webkitHidden	!== undefined		? 'webkitvisibilitychange' :
			console.assert(false, "Page Visibility API unsupported")
		))));
		var documentStr	= (document.hidden !== undefined ? 'hidden' :
			(document.mozHidden	!== undefined ? 'mozHidden' :
			(document.msHidden	!== undefined ? 'msHidden' :
			(document.webkitHidden	!== undefined ? 'webkitHidden' :
			console.assert(false, "Page Visibility API unsupported")
		))));
		// event handler for visibilitychange event
		var callback	= function(){
			var isHidden	= document[documentStr] ? true : false
			
            //This line of code mutes audio when tab is inactive. This is bad!
            
            //gainNode.gain.value	= isHidden ? 0 : 1
		}.bind(this)
		// bind the event itself
		document.addEventListener(eventStr, callback, false)
		// destructor
		this.destroy	= function(){
			document.removeEventListener(eventStr, callback, false)
		}
	}
}
var WebAudiox	= WebAudiox	|| {}

/**
 * Helper to load a buffer
 * 
 * @param  {AudioContext} context the WebAudio API context
 * @param  {String} url     the url of the sound to load
 * @param  {Function} onLoad  callback to notify when the buffer is loaded and decoded
 * @param  {Function} onError callback to notify when an error occured
 */
WebAudiox.loadBuffer	= function(context, url, onLoad, onError){
	onLoad		= onLoad	|| function(buffer){}
	onError		= onError	|| function(){}
        if( url instanceof Blob ){
		var request	= new FileReader();
        }
        else {
		var request	= new XMLHttpRequest()
		request.open('GET', url, true)
		request.responseType	= 'arraybuffer'
        }
	// counter inProgress request
	WebAudiox.loadBuffer.inProgressCount++
	request.onload	=  function(){
		context.decodeAudioData(request.response, function(buffer){
			// counter inProgress request
			WebAudiox.loadBuffer.inProgressCount--
			// notify the callback
			/onLoad(buffer)
			// notify
			WebAudiox.loadBuffer.onLoad(context, url, buffer)
		}, function(){
			// notify the callback
			onError()
			// counter inProgress request
			WebAudiox.loadBuffer.inProgressCount--
		})
	}
	request.send()
}

/**
 * global onLoad callback. it is notified everytime .loadBuffer() load something
 * @param  {AudioContext} context the WebAudio API context
 * @param  {String} url     the url of the sound to load
 * @param {[type]} buffer the just loaded buffer
 */
WebAudiox.loadBuffer.onLoad	= function(context, url, buffer){}

/**
 * counter of all the .loadBuffer in progress. usefull to know is all your sounds
 * as been loaded
 * @type {Number}
 */
WebAudiox.loadBuffer.inProgressCount	= 0

/**
 * shim to get AudioContext
 */
window.AudioContext	= window.AudioContext || window.webkitAudioContext;

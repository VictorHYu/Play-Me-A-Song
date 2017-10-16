/*  WebAudiox helpers for WebAudio API
 *    (Partial - unused helpers removed)
 *
 *  By jeromeetienne (https://github.com/jeromeetienne/webaudiox)
 *  MIT License
 *
 *  Small modifications made
 */

var WebAudiox	= WebAudiox	|| {}

WebAudiox.AnalyserBeatDetector = function(analyser, onBeat) {
    // arguments default values
    this.holdTime = 1;
    this.decayRate = 0.97;
    this.minVolume = 0.6;
    this.frequencyBinCount = 100;
    var holdingTime    = 0;
    
    this.update = function(delta) {
        var threshold = this.minVolume + 0.2*settings.beatThreshold/50;
        var rawVolume = WebAudiox.AnalyserBeatDetector.compute(analyser, this.frequencyBinCount)
        if( holdingTime > 0 ) {
            holdingTime    -= delta
            holdingTime    = Math.max(holdingTime, 0)
        }
        else if ( rawVolume > threshold ) {
            holdingTime    = this.holdTime;
            threshold = rawVolume * 1.1;
            threshold = Math.max(threshold, this.minVolume);
            return true
        }
        else {
            threshold *= this.decayRate;
            threshold = Math.max(threshold, this.minVolume);
            return false
        }
    }
}

WebAudiox.AnalyserBeatDetector.compute    = function(analyser, width, offset) {
    // handle parameter
    width = width  !== undefined ? width : analyser.frequencyBinCount;
    offset = offset !== undefined ? offset : 0;
    // inint variable
    var freqByte    = new Uint8Array(analyser.frequencyBinCount);
    // get the frequency data
    analyser.getByteFrequencyData(freqByte);
    // compute the sum
    var sum    = 0;
    for(var i = offset; i < offset+width; i++) {
        sum    += freqByte[i];
    }
    // complute the amplitude
    var amplitude = sum / (width*256-1);
    return amplitude;
}

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
			
            //This line of code mutes audio when tab is inactive
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

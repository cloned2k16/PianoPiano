//window.AudioContext = window.AudioContext || window.webkitAudioContext;

const   ND      				= 	undefined
    ,   FN                      =   Function.apply
    ,   round2                  =   (n)             =>  { return Math.round(( n + Number.EPSILON) * 100) / 100;                     }
    ,   _log                    =   function ()         { FN.call(console.log  , console, arguments);                               }
    ,   _err                    =   function ()         { FN.call(console.error, console, arguments);                               }
    ,   url     = new URL(window.location)
    ,   query   = window.location.search.substring(1)
    ,   gfx     = document.getElementById('display')
    ,   getEl   = ( id )                            => {
            let     d=document
                ,   e=d.getElementById(id)
                ;
                return {
					el 		: e
				 ,	floatV 	: () => { return parseFloat(el.value.replace(',','.')) }
				 ,	intV   	: () => { return parseInt(el) }
                }
        }
    ,   param   = ( nm )                            => {
        return url.searchParams.get(nm);
    }
    ,   paramF  = ( nm )                            => {
        if (param(nm)==ND) return ND; else return parseFloat(param(nm).replace(',','.'));
    }
	,	perElisa    = [  'mi','re#','mi','re#','mi'
						,'si','re','do','la','',''
						,'do','mi','la','si','','',''
						,'mi','sol#','si','do',''
						//,'mi','re#','mi','re#','mi',''
						//,'si','re','do','la',''
						//,'do','mi','la','si',''
						//,'mi','do','si','la',''
						//,'si','do','re','mi',''
						//,'sol','fa','mi','re',''
						//,'fa','mi','re','do',''
						//,'mi','re','do','si',''
						/*
						Mi re# mi re# mi si re do la
						Do mi la si
						Mi sol# si do */
						]
    //,   ctx     	= gfx.getContext('2d')
    //,   width   	= gfx.width
    //,   height  	= gfx.height
	,	notes       = ['DO','DO#','RE','RE#','MI','FA','FA#','SOL','SOL#','LA','LA#','SI']
	,	R           = 1
    ,   PI      	= Math.PI
    ,   PI2     	= 2*PI
 	, 	defStrokeC	= '#22a39377'
	,   playBttn    = getEl('playBttn')
	,   playNorm    = getEl('playOld')
	,   playElisa   = getEl('playElisa')
	,   keybox      = getEl('keybox')
	,   keyW        = document.getElementsByClassName('white')
	,   keyB        = document.getElementsByClassName('black')
	,   keyClick    = (e) => {
		var id		=e.target.id
		,	tone 	=id.substring(1)
		,   octave  =tone/12>>0 
		,	note    =tone % (octave * 12)
		//_log("click",id,tone,octave,note);
		octave-=2;
		playNote(note,octave,0.1,0.02)
	}
	,	playNote	=	(note,octave,duration) => {
		var audioCtx = new AudioContext()	
		let o 			= audioCtx.createOscillator()
		,   sweepEnv 	= audioCtx.createGain()
		,	time        = 	0.001
		,	lenght		=	0.42
		,	attackTime	=	0.011
		,	releaseTime	=	0.007
		;
		sweepEnv.gain.cancelScheduledValues(time);
		sweepEnv.gain.setValueAtTime(0, time);
		sweepEnv.gain.linearRampToValueAtTime(1, time + attackTime);
		sweepEnv.gain.linearRampToValueAtTime(0, time + lenght - releaseTime);
		o.type = 'sine';
		o.frequency.value=getFreq(note,octave);
		o.connect(sweepEnv).connect(audioCtx.destination);
		o.start(time);
		o.stop (time+lenght);
	}
	,	getFreq 	=	(note,octave) => {
		 _log(notes[note]);
		 if (note>8){
		   octave++	 
		   note=(note+3)%12 
		 }
		 else {
  		   note=(note+3)%12 
		 }
		 let 	scale = Math.pow(2,octave)
		 ,		base  = 26.25 * scale
		 ,		semi =  3.75  * scale
		 var freq=base
		 var nn,ss
		 
		 switch (note){
			 case 0:  nn=0; break; 
			 case 2:  nn=1; break; 
			 case 3:  nn=2; break; 
			 case 5:  nn=3; break; 
			 case 7:  nn=4; break; 
			 case 8:  nn=5; break; 
			 case 10: nn=6; break; 

			 case 1:  nn=0.5; break; 
			 case 4:  nn=2.5; break; 
			 case 6:  nn=3.5; break; 
			 case 9:  nn=5.5; break; 
			 case 11: nn=6.5; break; 
			 break;
		 }
		 freq=base+nn*semi
		_log('getFreq',freq,base,semi,note,octave);
		
		return freq; 
	}
	;
	
	var arr 		= []
	,	volume 		= 0.2
	,	seconds 	= 0.5
	,	tone 		= 420
	,	tstep       = Math.pow(2,(1/12))
	,   pstep       = 2*2*3*5
	,   elId
	;
	
	for(elId in keyW){
		var el=keyW[elId]
		el.onclick= keyClick
	}
	for(elId in keyB){
		var el=keyB[elId]
		el.onclick= keyClick
	}
	
	playElisa.el.onclick =  function (e) {
	 _log('here we go..');
	 var time=0;
     for ( n in perElisa	){
		 let note=perElisa[n]
		 let idx=notes.indexOf(note.toUpperCase())
		 if (idx>=0){
			 //_log("note",note,idx);
			setTimeout(()=>{ playNote(idx,idx<=5?4:3,0.33)},time);
		 }
		 time+=250
		 
	 }
	}
	
	playBttn.el.onclick =  function (e) {
		context 	=  new AudioContext()	
		var z=0
		for (var n=0; n<14; n++){
			
			var scale = 1+ n/7<<0
			hz= (tone*scale)+pstep*scale*(n%7)
			_log('hz',hz);
				for (var i = 0; i < context.sampleRate * seconds; i++) {
					arr[z++] = sineWaveAt(i, hz) * volume
				}
			if (n==6 || n==13){
				_log('pause');
				for (var i = 0; i < context.sampleRate * seconds; i++) {
					arr[z++] = 0
				}
			}
		}
		_log("playing");
		playSound(arr)	
		
	}

	playNorm.el.onclick =  function (e) {
		_log('play normal');
		context 	=  new AudioContext()	
		var z=0
		,	skip=[1,3,6,8,10];
		
		for (var n=0; n<12; n++){
			var hz= tone*Math.pow(tstep,n) 
			if (skip.includes(n)){
				//_log('skipping',n,hz);
			}
			else {
			//_log('hz',hz);
				for (var i = 0; i < context.sampleRate * seconds; i++) {
					arr[z++] = sineWaveAt(i, hz) * volume
				}
			}
		}
		_log("playing");
		playSound(arr)	
	};

	function playSound(arr) {
		var buf = new Float32Array(arr.length)
		for (var i = 0; i < arr.length; i++) buf[i] = arr[i]
		var buffer = context.createBuffer(1, buf.length, context.sampleRate)
		buffer.copyToChannel(buf, 0)
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(context.destination);
		source.start(0);
	}

	function sineWaveAt(sampleNumber, tone) {
		var sampleFreq = context.sampleRate / tone
		return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
	}


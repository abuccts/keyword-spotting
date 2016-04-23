var date = new Date();
var load = document.getElementById("load");

function startRecord() {
    // if micro is pressed, we start recording
    recording = true;
    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = 0;
    recordingLength = 0;
    outputElement.innerHTML = 'Recording now ...';
    // if S is pressed, we stop the recording and package the WAV file
}


function stopRecord() {
    // we stop recording
    recording = false;

    outputElement.innerHTML = 'Uploadinging wav file ...';
	
    // we flat the left and right channels down
    var leftBuffer = mergeBuffers ( leftchannel, recordingLength );
    var rightBuffer = mergeBuffers ( rightchannel, recordingLength );
    // we interleave both channels together
    var interleaved = interleave ( leftBuffer, rightBuffer );

    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++){
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final binary blob
    var blob = new Blob ( [ view ], { type : 'audio/wav' } );


    var filename = 'audio_' + new Date().getTime() + '.wav';

	

    // let's save it locally
    // outputElement.innerHTML = 'Handing off the file now...';
    var url = (window.URL || window.webkitURL).createObjectURL(blob);


    uploadAudio(blob, filename);
	
	setTimeout("load.style.visibility='visible'", 500);
	load.scrollIntoView();
	
	outputElement.innerHTML = 'Press to start speaking';
}


function uploadAudio(wavData, filename){
	var reader = new FileReader();
	reader.onload = function(event){
		var fd = new FormData();
		var wavName = encodeURIComponent(filename);

		fd.append('fname', wavName);
		fd.append('data', event.target.result);
		$.ajax({
			type: 'POST',
			url: '/upload',
			data: fd,
			processData: false,
			contentType: false,
            success: function (res) {
                if (res.status == 0) {
                    var id = res.id;
                    var itv = setInterval(function () {
                        $.get('/upload/' + id, function (res) {
							clearInterval(itv);
							load.style.visibility='hidden';
                        });
                    }, 500);
					var str = res.seq;
					$('#result').html('<h1>' + str + '</h1>');
                }
            },
            error: function () {
                console.log(arguments);
            }
		});
	};
	reader.readAsDataURL(wavData);
}


$(document).ready(function() {
  $('button').click(function() {
	$('#result').html('<img src="img/load.gif">');
	var query = new FormData();
	query.append('seq', document.getElementById('input').value);
	//document.getElementById('input').value = '';
	document.getElementById('input').disabled = true;
	$.ajax({
			type: 'POST',
			url: '/public',
			data: query,
			processData: false,
			contentType: false,
			dataType: 'JSON',
			success: function(res) {
				if (res.status == 0) {
					$('#result').html('<table class="table"><tbody></tbody></table>');
					$.each(res.data, function(i, field) {
						var audioname = window.location + 'audio/' + field[0] + '.mp3'; 
						$('#result').children('table').children('tbody').append('<tr><td>' + 
									i + '</td><td>' + field[0] + '</td><td>' + field[1] + 
									'</td><td><img height="15px" src="img/laba.png" onclick="var Sound=new buzz.sound(\'' +
									audioname + '\');Sound.play();"></td></tr>');
					});
					//console.log(res.data);
				}
				else {
					$('#result').html('<h2>Not Found : (</h2>');
				}
				//document.getElementById('input').value = '';
				document.getElementById('input').disabled = false;
				document.getElementById('input').focus();
			},
			error: function(res) {
				console.log(arguments);
			}
		});
	});
});

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
						$('#result').children('table').children('tbody').append('<tr><td>' + 
									i + '</td><td>' + field[0] + '</td><td>' + field[1] + '</td></tr>');
					});
					//console.log(res.data);
				}
				else {
					$('#result').html('<h2>Not Found : (</h2>');
				}
				document.getElementById('input').value = '';
				document.getElementById('input').disabled = false;
				document.getElementById('input').focus();
			},
			error: function(res) {
				console.log(arguments);
			}
		});
	});
});
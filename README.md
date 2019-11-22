# BT DEMO SITE

This will be a scripted web-site that will eventually be invoked from behind a BT login.
It can be done in any backend web language, i.e. it cannot be done in the front end with javascript
because it contains making signed calls to veripass api which involves generating signautres
using a secret salt. 
- if you will be doing anything other than PHP (or Java) then you'll have to adapt the authentcation 
  time signature method from the API Document below and we will then incorporate the new example
  into the API doc). The signature uses a salt which means it has to be generated in the backend,
  i.e. we cannot expose the salt to javascript and generate 


The web site will have the following site-map structure

/ 			- index
/allocate-sim		- allocate

The web site doesn't need to be designed it can generate plain html mocking the BT Family SIM functionality
where parents can manage 5 different sim cards and associate them with the children.

The index / location will look something like this:
	<html>
		<body>
			<h3>BT Family SIM</h3>
			<ul>
				<li><a href="/allocatie-sim?sim=1"> SIM 1</a></li>
				<li><a href="/allocatie-sim?sim=2"> SIM 2</a></li>
				<li><a href="/allocatie-sim?sim=3"> SIM 3</a></li>
				<li><a href="/allocatie-sim?sim=4"> SIM 4</a></li>
				<li><a href="/allocatie-sim?sim=5"> SIM 5</a></li>
			</ul>
		<body>
	</html>


When the user navigates to the /allocation-sim?sim=<n> page there will be a VPR IFrame
incorporated according to Product API Specification 2.2.1-DRAFT 
- see google drive https://drive.google.com/drive/u/3/folders/1FpiSWM9hgnlzBTDuj-C4J2OK1J3KJkhA)
- there is a similar  example implementation in the fa-demo-site repo under public/vpr-demo.php


The web-site will be eventually placed behind bt-demo.veripass.uk when it will be invoked from behind
a bt loging proxy which will inject bt session cookie which we'll have to read and potentially validate.
if the bt session cookie is not present the access will be 403 Forbidden.

If we will be able to extract the bt contact mobile number of the user using the bt session cookie than
that will be used to prepopulate the iframe contact field.

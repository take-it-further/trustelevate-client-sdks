import React from 'react';
import {firstName} from './utils';

class AssignChildForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      child: props.child,
      alias: props.alias,
      contact: props.contact,
      name: "",
      dob: "",
      adding: false,
      submitted: false
    };
    this.clickCancel = this.clickCancel.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSelectChild = this.onSelectChild.bind(this);
    this.onAddChild = this.onAddChild.bind(this);

  }

  componentWillReceiveProps(nextProps) {
    this.setState({submitted: false, child: nextProps.child})
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
    }
  }

  clickCancel(event) {
    this.setState({adding: false, child: this.props.child});
  }

  updateForm(event) {
    event.preventDefault();
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({submitted: true, adding: false});
    this.props.root.assignConsent(this.state);
    this.timer = setTimeout(() => this.setState({submitted: false}), 5000)
  }

  onAddChild() {
    this.setState({adding: true, child: 0});
  }
  onSelectChild(event) {
    event.preventDefault();
    this.setState({submitted: true});
    let data = this.state;
    data.child = Number(event.target.value);
    this.props.root.assignConsent(data);
    this.timer = setTimeout(() => this.setState({child: 0, submitted: false}), 5000)
  }

  render() {
    const style = {color: this.props.status === "REJECTED" ? "red" : (this.props.status === "APPROVED" ? "green" : "black")};
    const line = this.props.status === "REJECTED" ? <em>cannot</em> : (this.props.status === "APPROVED" ? <em>can</em> : <em>is asking to</em>);
    const pdata = this.props.providers[this.props.service.provider];
    const provider = pdata ? pdata.data : { description: "?"};

    return (<div>
      {this.state.submitted && (<span>moment please..</span>)}

      {!this.state.submitted && this.state.adding && (<div className="modal is-active">
        <div className="modal-background" />
        <div className="modal-content">
          <div className="modal-box">
            <div className="box">
              <div className="content">
                <div className="columns">
                  <div className="column">
                    <h1 className="title is-4 has-text-weight-bold">Consent Request for a New Child</h1>
                    <p className="subtitle is-5 has-text-grey">Please enter details of the child to confirm you are their parent/guardian.</p>
                    <form onSubmit={this.handleSubmit}>
                      <fieldset>
                        <div className="field">
                          <div className="control input-wrapper">
                            <input className="input" name="name" type="text" placeholder="Full Name" value={this.state.name} onChange={this.updateForm}/>
                          </div>
                        </div>
                        <div className="field">
                          <div className="control input-wrapper">
                            <input className="input" type="text" placeholder="Date of Birth" name="dob" value={this.state.dob} onChange={this.updateForm} data-toggle="datepicker"/>
                          </div>
                        </div>
                      </fieldset>
                      <button type="submit" className="button is-primary is-large is-rounded is-fullwidth">Create and Assign to this Child</button>
                    </form>
                  </div>
                </div>
                <div className="columns">
                  <div className="column">
                    <p className="is-size-7 has-text-centered">These details will be checked against your child's school records and will not be sent to any third parties</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={this.clickCancel}/>
      </div>)}

      {!this.state.submitted && !this.state.adding && (
          <div className="field">
            <div className="control">
              <div className="select is-rounded">

                <select name="child" onChange={this.onSelectChild} value={this.state.child} className={"button is-primary "} >
                  {this.props.status === "PENDING" && !this.state.child && (<option>Assign</option>)}
                  <optgroup label="To">
                    {Object.keys(this.props.children).map((pid) =>
                        <option key={pid} value={pid}>{firstName(this.props.children[pid].data.pii)}</option>)}
                  </optgroup>
                </select>
              </div>
              {!this.state.child && (
                  <div className="level-left" style={{display: "inline-block"}}>
                    <span style={{ display: "inline-block", margin: "6px"}}>or</span>
                    <button className="button is-primary is-rounded" style={{paddingLeft: "1rem", paddingRight: "1rem"}} onClick={this.onAddChild}>Add Child</button>
                  </div>)}
            </div>
          </div>)}

    </div>)
  }
}

export default AssignChildForm;
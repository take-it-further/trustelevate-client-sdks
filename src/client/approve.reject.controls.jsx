import React from 'react';

class ApproveRejectControls extends React.Component {
  constructor(props) {
    super(props);
    this.onApprove = this.onApprove.bind(this);
    this.onReject = this.onReject.bind(this);
  }

  onApprove(event) {
    this.props.root.approveConsent(this.props.alias, this.props.contact)
  }

  onReject(event) {
    this.props.root.rejectConsent(this.props.alias, this.props.contact)
  }

  render() {
    return (<span>
            &nbsp;&nbsp;
      {this.props.status !== "APPROVED" && <button className={this.props.status === "PENDING" ? "button is-primary is-rounded" : "button is-rounded"} onClick={this.onApprove}>Approve</button>}
      {this.props.status === "PENDING" && (<span>&nbsp;&nbsp;&nbsp;</span>)}
      {this.props.status !== "REJECTED" && <button className={this.props.status === "PENDING" ? "button is-danger is-rounded" : "button is-rounded"} onClick={this.onReject}>Block</button>}
        </span>);
  }
}

export default ApproveRejectControls;
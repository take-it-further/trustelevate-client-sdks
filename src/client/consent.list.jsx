import React from 'react';
import {since, titleCase, baloon, firstName} from './utils';
import AssignChildForm from "./assign.child.form";
import ApproveRejectControls from "./approve.reject.controls";

class ConsentList extends React.Component {

  render() {
    const consents = Object.keys(this.props.consents)
    .map((alias) => ({alias: alias, consent: this.props.consents[alias].data}))
    .filter(item => item.consent.status === this.props.status)
    .sort((a,b) => b.consent.updatedUTC - a.consent.updatedUTC );

    return (<div className={this.props.className}>{consents.map((item, index) => {
          const status = titleCase(item.consent.verification);
          const service = this.props.services[item.consent.service].data;
          const child = this.props.children[item.consent.child];
          return (<div className={"box " + this.props.className} key={item.alias}>
                <div className="level">
                  <div className="level-left">
                    {item.consent.child > 0 && child.data && (<div >
                      {baloon(item.consent.child, this.props.children, "small")}
                      {firstName(child.data.pii)}
                      {firstName(child.data.pii) !== item.consent.username && (<span>&nbsp;({item.consent.username})</span>)}
                    </div>)}
                    {item.consent.child <= 0 && <span>{item.consent.username}</span>}
                  </div>
                  <div className="level-right"><span className="has-text-grey-light">{since(item.consent.updatedUTC)}</span></div>
                </div>
                <hr/>
                <div className="columns">
                  <div className="column">
                    <div className="media">
                      <div className="media-left">
                        <figure className="image is-64x64 service-icon">
                          <img src={service.iconUrl} />
                        </figure>
                      </div>
                      <div className="media-content">
                        <div className="content">
                          <h3 className="title">{service.service}</h3>
                          <h4 className="subtitle has-text-grey-light is-size-6">By {service.provider}</h4>
                          <p>{service.description}</p>
                          <p><a href={service.infoUrl} target="_blank">Visit site</a></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="column is-narrow has-text-right-mobile">
                    {item.consent.child > 0 && (<div>
                      <ApproveRejectControls root={this.props.root} status={item.consent.status} alias={item.alias}
                                             contact={item.consent.contact.value}/>
                    </div>)}
                    {item.consent.child <= 0 && (<div>
                      <AssignChildForm
                          root={this.props.root}
                          alias={item.alias}
                          status={item.consent.status}
                          child={item.consent.child}
                          username={item.consent.username}
                          service={service}
                          providers={this.props.providers}
                          contact={item.consent.contact.value}
                          updated={item.consent.updatedUTC}
                          children={this.props.children}/>
                    </div>)}
                  </div>
                </div>
              </div>
          );
        }
    )}</div>);
  }
}

export default ConsentList;
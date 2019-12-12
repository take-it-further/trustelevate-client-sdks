import React from 'react';

class ServiceList extends React.Component {
  render() {
    const data = {};
    Object.keys(this.props.services).forEach((id) => {
      const service = this.props.services[id].data;
      service.id = id
      if (data[service.provider] == undefined) {
        data[service.provider] = [];
      }
      data[service.provider].push(service);
    });

    return (
        <div id="services">
          {Object.keys(data).map((provider) => (
              <div key={provider}>
                {data[provider].map((service) => (<div className="box" key={service.service}>
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
                            <p>Consent age: <span className="tag is-primary is-rounded has-text-weight-bold">{service.consentAge}</span></p>
                            <p><a href={service.infoUrl} target="_blank">Visit site</a></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>))}
              </div>))}
        </div>
    );
  }
}

export default ServiceList;
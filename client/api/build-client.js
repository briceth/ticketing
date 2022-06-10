import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // next server
    // 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
    return axios.create({
      baseURL: 'http://www.ticketing-ms-app.shop',
      headers: req.headers,
    });
  } else {
    // browser
    return axios.create({
      baseURL: '/',
    });
  }
};

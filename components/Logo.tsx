
import type { SVGProps } from 'react';

type LogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export default function Logo({ title = 'Multilog', className, ...rest }: LogoProps) {
  const classes = ['logo', className].filter(Boolean).join(' ');

  return (
    <svg
      version="1.1"
      role="img"
      aria-label={title}
      className={classes}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 532.7 151"
      xmlSpace="preserve"
      {...rest}
    >
      <polygon className="fillColor" points="363,126.7 394.3,126.7 394.3,139.4 348.6,139.4 348.6,63.3 363,63.3" />
      <path
        className="fillColor"
        d="M457.8,117.1c0,12.7-7.3,23.4-28.8,23.4c-21.5,0-28.8-10.7-28.8-23.4V85.6c0-12.7,7.3-23.4,28.8-23.4
        c21.5,0,28.8,10.7,28.8,23.4V117.1z M414.6,116.3c0,7.2,3.7,11.5,14.4,11.5c10.7,0,14.4-4.3,14.4-11.5V86.4
        c0-7.2-3.7-11.5-14.4-11.5c-10.7,0-14.4,4.3-14.4,11.5V116.3z"
      />
      <path
        className="fillColor"
        d="M479.7,115.9c0,7.4,3.2,11.8,13.3,11.8c3.9,0,7.9-0.3,11.8-0.9v-23.1h13.6v33.5c-8,2.3-17.5,3.4-25.5,3.4
        c-18.6,0-27.5-7.9-27.5-23V85.1c0-15.7,9.1-23,28.9-23c6.2,0,15,0.7,21.8,2.5l-1.6,12.6c-7-1.5-13.9-2.1-21.4-2.1
        c-10.1,0-13.4,4.1-13.4,11.9V115.9z"
      />
      <rect x="286.3" y="118.7" className="fillColor" width="48.4" height="20.8" />
      <rect x="286.3" y="91" className="fillColor" width="48.4" height="20.8" />
      <rect x="286.3" y="63.3" className="fillColor" width="48.4" height="20.8" />
      <rect x="286.3" y="35.6" className="fillColor" width="48.4" height="20.8" />
      <rect x="286.3" y="7.9" className="fillColor" width="48.4" height="20.8" />
      <polygon
        className="fillColor"
        points="62.8,129.6 44.5,129.6 30.4,90.1 29.2,139.4 14.4,139.4 17.9,63.3 34,63.3 53.6,117.3 73.3,63.3 89.4,63.3 92.8,139.4 78.1,139.4 76.8,90.1"
      />
      <path
        className="fillColor"
        d="M155.4,63.3v54.1c0,12-6.7,23.2-28.1,23.2c-21.4,0-28.1-11.2-28.1-23.2V63.3h14.4v52.9
        c0,7.4,3.5,11.7,13.7,11.7c10.2,0,13.7-4.2,13.7-11.7V63.3H155.4z"
      />
      <polygon className="fillColor" points="176.9,126.7 208.2,126.7 208.2,139.4 162.4,139.4 162.4,63.3 176.9,63.3" />
      <polygon className="fillColor" points="215.1,76 193.9,76 193.9,63.3 250.8,63.3 250.8,76 229.5,76 229.5,139.4 215.1,139.4" />
      <rect x="258" y="63.3" className="fillColor" width="14.4" height="76.1" />
    </svg>
  );
}

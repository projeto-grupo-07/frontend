
export const Navbar = ({ logo, actions, children }) => {
  return (
    <nav className="h-16 bg-white shadow-md px-6 flex items-center justify-between">
      <div className="flex-shrink-0">
        {logo}
      </div>


      <ul className="flex gap-6 mx-4">
         {children}
      </ul>

      <div className="flex-shrink-0">
        {actions}
      </div>
    </nav>
  );
};


import styles from "./Navbar.module.css"
import Link from "next/link"
import { useEffect, useState } from "react"

export const Navbar = () => {
  const [displayMenu, setDisplayMenu] = useState(false)

  function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  useEffect(() => {
    if (displayMenu) {
      const menu = document.getElementById(styles.menu)
      menu?.style.setProperty("--display", "flex")
      delay(100).then(() => menu?.style.setProperty("--move", "0%"))
    } else {
      const menu = document.getElementById(styles.menu)
      menu?.style.setProperty("--display", "none")
      delay(100).then(() =>menu?.style.setProperty("--move", "100%"))
    }
  }, [displayMenu])

  return (
    <div>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          Delimit
        </div>
        <button onClick={()=>setDisplayMenu(!displayMenu)} className={styles.menuSmall}>Menu</button>
        <div className={styles.menuBig}>
          <Link href={"/#"}>About Us</Link>
          <Link href={"/#"}>Docs</Link>
          <Link href={"/#"}>Github</Link>
          <Link href={"/#"}>Roadmap</Link>
        </div>
        <div id={styles.menu}>
          <Link href={"/#"}>About Us</Link>
          <Link href={"/#"}>Docs</Link>
          <Link href={"/#"}>Github</Link>
          <Link href={"/#"}>Roadmap</Link>
        </div>
      </nav>
    </div>
  )
}
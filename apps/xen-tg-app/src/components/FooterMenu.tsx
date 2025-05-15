import { FC } from 'react'
import { Link } from 'react-router'

type Props = {
  memoriesNumber?: number | null
}

const FooterMenu: FC<Props> = ({ memoriesNumber }) => {
  return (
    <div className="flex w-max rounded-[20px] border border-(--color-opposite-text) p-3 backdrop-blur-xs dark:border-(--color-main-text)/30">
      <Link to="/memories">
        <div className="flex items-center justify-center p-2.5 select-none">
          <h2 className="text-[18px]/[150%] font-semibold text-(--color-my-primary) dark:text-(--color-main-text)">
            Memories ({memoriesNumber ?? '-'})
          </h2>
        </div>
      </Link>
    </div>
  )
}

export default FooterMenu

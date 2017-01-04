class RootController < SDN
  get '/' do
    flash_info "Thanks for nothing"
    logger.debug "test message"
    File.read(File.join('views', 'index.html'))
  end
end

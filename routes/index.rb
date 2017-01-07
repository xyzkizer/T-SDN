class RootController < SDN
  get '/' do
    flash_info "Thanks for nothing"
    logger.debug "test message"
    File.read(File.join('views', 'index.html'))
  end

  get '/topograph' do
    content_type :json

    logger.debug $redis.get('hw-net-topology')

    $redis.get('hw-net-topology')
  end
end
